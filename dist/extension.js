// src/extension.ts
import fs2 from "node:fs";
import assert from "node:assert";
import http from "node:http";
import https from "node:https";

// src/utils/compression.ts
import zlib from "node:zlib";
async function decompress(body, encoding) {
  switch (encoding) {
    case "gzip":
      return new Promise((resolve, reject) => zlib.gunzip(body, (err, result) => err ? reject(err) : resolve(result)));
    case "deflate":
      return new Promise((resolve, reject) => zlib.inflate(body, (err, result) => err ? reject(err) : resolve(result)));
    case "br":
      return new Promise((resolve, reject) => zlib.brotliDecompress(body, (err, result) => err ? reject(err) : resolve(result)));
    default:
      return body;
  }
}
async function compress(body, encoding) {
  switch (encoding) {
    case "gzip":
      return new Promise((resolve, reject) => zlib.gzip(body, (err, result) => err ? reject(err) : resolve(result)));
    case "deflate":
      return new Promise((resolve, reject) => zlib.deflate(body, (err, result) => err ? reject(err) : resolve(result)));
    case "br":
      return new Promise((resolve, reject) => zlib.brotliCompress(body, (err, result) => err ? reject(err) : resolve(result)));
    default:
      return body;
  }
}

// src/config.ts
import path from "node:path";

class ConfigLoader {
  static instance;
  static async loadConfig(configPath) {
    return this.instance = await import(path.resolve(process.cwd(), configPath));
  }
}

// src/handlers.ts
import { spawnSync } from "child_process";
import path2 from "node:path";
import { tmpdir } from "os";
import fs from "fs/promises";
var handlerBuildCache = new Map;

class BaseHandlerImpl {
  _handlerName;
  _handler;
  constructor(handlerName, handlerPath) {
    this._handlerName = handlerName;
    this._handler = buildAndImportHandler(handlerPath);
  }
  async handleRequest(request, response) {
    throw new Error("Not implemented");
  }
  get handler() {
    return this._handler;
  }
}

class ProxyHandlerImpl extends BaseHandlerImpl {
  static HINT = "proxy";
  constructor(handlerName, handlerPath) {
    super(handlerName, handlerPath);
    this._handler = this._handler.then((handler) => {
      logger.debug(`Proxy handler '${handlerName}' built successfully.`);
    }).catch((err) => {
      logger.error(`Unable to compile '${handlerPath}': ${err}`);
      handlerBuildCache.delete(handlerPath);
      return;
    });
  }
  get transformRequest() {
    return async (request) => {
      const handlerModule = await this.handler;
      return handlerModule.transformRequest(request);
    };
  }
  get transformResponse() {
    return async (rawBody, response, request) => {
      const handlerModule = await this.handler;
      return handlerModule.transformResponse(rawBody, response, request);
    };
  }
  async handleRequest(request, response) {
  }
}

class ComputeHandlerImpl extends BaseHandlerImpl {
  static HINT = "compute";
  constructor(handlerName, handlerPath) {
    super(handlerName, handlerPath);
    this._handler.then((handler) => {
      logger.debug(`Compute handler '${handlerName}' built successfully.`);
      return handler;
    }).catch((err) => {
      logger.error(`Unable to compile '${handlerPath}': ${err}`);
      handlerBuildCache.delete(handlerPath);
    });
  }
  async handleRequest(request, response) {
  }
}
async function getHandlersFromConfig(config) {
  const handlerTypes = [ComputeHandlerImpl, ProxyHandlerImpl];
  const handlers = config.transforms;
  const handlerInstances = Object.entries(handlers).map(([handlerName, handlerPath]) => {
    const [handlerType, handlerId] = handlerName.split(":");
    if (!handlerType || !handlerId) {
      throw new Error(`Invalid handler name: ${handlerName}`);
    }
    const MatchedHandler = handlerTypes.find((handler) => handler.HINT === handlerType);
    if (!MatchedHandler) {
      throw new Error(`Invalid handler type: ${handlerType}. Valid types are: ${handlerTypes.map((handler) => handler.HINT).join(", ")}`);
    }
    const handlerInstance = new MatchedHandler(handlerName, handlerPath);
    return [handlerName, handlerInstance];
  });
  const resolvedHandlers = await Promise.all(handlerInstances.map(([handlerName, handlerInstance]) => handlerInstance.handler));
  return Object.fromEntries(resolvedHandlers);
}
async function buildAndImportHandler(handlerPath) {
  if (handlerBuildCache.has(handlerPath)) {
    return handlerBuildCache.get(handlerPath);
  }
  const buildPromise = new Promise(async (resolve, reject) => {
    const tmpOutputPath = path2.join(tmpdir(), `handler_${Date.now()}.mjs`);
    handlerPath = path2.resolve(handlerPath);
    const buildResult = spawnSync("bun", ["build", handlerPath, "--target", "node", "--format", "esm", "--outfile", tmpOutputPath], {
      encoding: "utf-8"
    });
    if (buildResult.error || buildResult.status !== 0) {
      reject(new Error(`Unable to compile '${handlerPath}': ${buildResult.stderr || buildResult.error?.message}`));
      return;
    }
    const module = await import(`file://${tmpOutputPath}`);
    await fs.unlink(tmpOutputPath).catch(() => {
    });
    resolve(module.default || module);
  });
  handlerBuildCache.set(handlerPath, buildPromise);
  return buildPromise;
}

// src/extension.ts
var [logInfo, logDebug, logError, logWarn] = ["info", "debug", "error", "warn"].map((method) => {
  const fn = logger[method];
  return (message) => {
    fn(`[harperdb-proxy-transform] ${message}`);
  };
});
function assertType(name, option, expectedType) {
  if (option) {
    const found = typeof option;
    assert.strictEqual(found, expectedType, `${name} must be type ${expectedType}. Received: ${found}`);
  }
}
function resolveConfig(options) {
  assertType("configPath", options.configPath, "string");
  return {
    configPath: options.configPath ?? "hdb.edgio.config.js"
  };
}
function start(options) {
  const config = resolveConfig(options);
  logInfo(`Starting extension...`);
  return {
    async handleDirectory(_, componentPath) {
      const proxyConfig = await ConfigLoader.loadConfig(config.configPath);
      const transformHandlers = await getHandlersFromConfig(proxyConfig);
      console.log("transformHandlers", transformHandlers);
      let transformReqFn;
      let transformResFn;
      if (!fs2.existsSync(componentPath) || !fs2.statSync(componentPath).isDirectory()) {
        throw new Error(`Invalid component path: ${componentPath}`);
      }
      options.server.http(async (request, nextHandler) => {
        const { _nodeRequest: req, _nodeResponse: res } = request;
        const { transformRequest, transformResponse } = {};
        if (transformRequest) {
          transformReqFn = transformRequest;
        }
        if (transformResponse) {
          transformResFn = transformResponse;
        }
        try {
          logDebug(`Incoming request: ${req.url.split("?")[0]}`);
          if (transformReqFn) {
            await transformReqFn(req);
          }
          const scheme = "https";
          const host = "www.google.com";
          req.headers.host = host;
          const protocol = scheme === "https" ? https : http;
          const upstreamOptions = {
            method: req.method,
            hostname: host,
            port: scheme === "https" ? 443 : 80,
            path: req.url,
            headers: req.headers
          };
          const proxyReq = protocol.request(upstreamOptions, (proxyRes) => {
            logDebug(`Received response from upstream: ${proxyRes.statusCode}`);
            const encoding = proxyRes.headers["content-encoding"];
            const chunks = [];
            proxyRes.on("data", (chunk) => chunks.push(chunk));
            proxyRes.on("end", async () => {
              let body = Buffer.concat(chunks);
              if (transformResFn) {
                const decompressedBody = await decompress(body, encoding ?? "");
                let transformedBody = await transformResFn(decompressedBody, proxyRes, proxyReq);
                if (transformedBody && transformedBody !== body) {
                  transformedBody = Buffer.isBuffer(transformedBody) ? transformedBody : Buffer.from(transformedBody);
                  const compressedBody = await compress(transformedBody, encoding ?? "");
                  const headers = { ...proxyRes.headers };
                  if (encoding) {
                    headers["content-encoding"] = encoding;
                    headers["content-length"] = Buffer.byteLength(compressedBody).toString();
                  } else {
                    delete headers["content-encoding"];
                    headers["content-length"] = Buffer.byteLength(compressedBody).toString();
                  }
                  res.writeHead(proxyRes.statusCode, headers);
                  res.end(compressedBody);
                  return;
                }
              }
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              res.end(body);
            });
          });
          req.pipe(proxyReq);
          proxyReq.on("error", (err) => {
            logError(`Proxy request error: ${err}`);
            res.statusCode = 502;
            res.end("Bad Gateway");
          });
        } catch (error) {
          logError(`Error handling proxy request: ${error}`);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
      return true;
    }
  };
}
export {
  start
};
