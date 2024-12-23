// src/extension.ts
import fs2 from "node:fs";
import assert from "node:assert";

// src/config.ts
import path from "node:path";

class ConfigLoader {
  static _edgioConfig;
  static instance;
  static async loadConfig(configPath) {
    return this.instance = await import(path.resolve(process.cwd(), configPath));
  }
  static async loadEdgioConfig() {
    return this._edgioConfig || (this._edgioConfig = (await import(path.resolve(process.cwd(), "edgio.config.js"))).default);
  }
}

// src/handlers.ts
import { spawnSync } from "child_process";
import path2 from "node:path";
import https from "node:https";
import http from "node:http";
import { tmpdir } from "os";
import fs from "fs/promises";

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

// src/handlers.ts
var handlerBuildCache = new Map;
var handlerInstanceCache = new Map;

class BaseHandlerImpl {
  _handlerName;
  _handler;
  constructor(handlerName, handlerPath) {
    this._handlerName = handlerName;
    this._handler = buildAndImportHandler(handlerPath).then((handler) => {
      logger.debug(`Handler '${handlerName}' built successfully.`);
      return handler;
    }).catch((err) => {
      logger.error(`Unable to compile '${handlerPath}': ${err}`);
      handlerBuildCache.delete(handlerPath);
      return;
    });
  }
  async handleRequest(request, response) {
    throw new Error("Not implemented");
  }
  get handler() {
    return this._handler;
  }
  get name() {
    return this._handlerName;
  }
}

class ProxyHandlerImpl extends BaseHandlerImpl {
  static HINT = "proxy";
  _originName;
  constructor(handlerName, handlerPath, originName) {
    super(handlerName, handlerPath);
    this._originName = originName;
  }
  async getOrigin() {
    let edgioConfig = await ConfigLoader.loadEdgioConfig();
    const origin = edgioConfig.origins.find((origin2) => origin2.name === this._originName);
    if (!origin) {
      throw new Error(`Origin '${this._originName}' not found in edgio.config.js`);
    }
    const scheme = origin.hosts[0].scheme || "https";
    const hostname = Array.isArray(origin.hosts[0].location) ? origin.hosts[0].location[0].hostname : origin.hosts[0].location;
    const port = Array.isArray(origin.hosts[0].location) ? origin.hosts[0].location[0].port || 443 : 443;
    const overrideHostHeader = origin.override_host_header || hostname;
    return { scheme, hostname, port, overrideHostHeader };
  }
  get transformRequest() {
    return async (request) => {
      const { transformRequest } = await this.handler;
      if (transformRequest) {
        return transformRequest(request);
      }
      return request;
    };
  }
  get transformResponse() {
    return async (rawBody, response, request) => {
      const handlerModule = await this.handler;
      return handlerModule.transformResponse(rawBody, response, request);
    };
  }
  async handleRequest(request, response) {
    const { scheme, hostname, port, overrideHostHeader } = await this.getOrigin();
    await this.transformRequest(request);
    const protocol = scheme === "https" ? https : http;
    request.headers.host = overrideHostHeader || hostname;
    const upstreamOptions = {
      method: request.method,
      hostname,
      port,
      path: request.url,
      headers: request.headers
    };
    const proxyReq = protocol.request(upstreamOptions, (proxyRes) => {
      logger.debug(`Received response from upstream: ${proxyRes.statusCode}`);
      const encoding = proxyRes.headers["content-encoding"];
      const chunks = [];
      proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("end", async () => {
        let body = Buffer.concat(chunks);
        const decompressedBody = await decompress(body, encoding ?? "");
        let transformedBody = await this.transformResponse(decompressedBody, proxyRes, proxyReq);
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
          response.writeHead(proxyRes.statusCode, headers);
          response.end(compressedBody);
          return;
        }
        response.writeHead(proxyRes.statusCode, proxyRes.headers);
        response.end(body);
      });
    });
    request.pipe(proxyReq);
    proxyReq.on("error", (err) => {
      logger.error(`Proxy request error: ${err}`);
      response.statusCode = 502;
      response.end("Bad Gateway");
    });
  }
}

class ComputeHandlerImpl extends BaseHandlerImpl {
  static HINT = "compute";
  constructor(handlerName, handlerPath) {
    super(handlerName, handlerPath);
  }
  async handleRequest(request, response) {
    this.handler.then((handler) => {
      handler(request, response);
    });
  }
}
async function loadHandlersFromConfig(config) {
  const handlers = config.handlers;
  const handlerInstances = Object.entries(handlers).map(([name, handler]) => {
    const { type, path: path3, origin } = handler;
    switch (type) {
      case "proxy":
        return [name, new ProxyHandlerImpl(name, path3, origin ?? "")];
      case "compute":
        return [name, new ComputeHandlerImpl(name, path3)];
    }
  }).filter(Boolean);
  await Promise.all(handlerInstances.map(([name, handlerInstance]) => {
    handlerInstanceCache.set(name, handlerInstance);
    return handlerInstance.handler;
  }));
  return handlerInstances.reduce((acc, [name, handlerInstance]) => {
    acc[name] = handlerInstance;
    return acc;
  }, {});
}
async function getHandler(name) {
  const handler = handlerInstanceCache.get(name);
  if (!handler) {
    throw new Error(`Handler '${name}' not found`);
  }
  return handler;
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
    configPath: options.configPath ?? "edgio.proxy.config.js",
    edgioConfigPath: options.edgioConfigPath ?? "edgio.config.js"
  };
}
function start(options) {
  const config = resolveConfig(options);
  logInfo(`Starting extension...`);
  return {
    async handleDirectory(_, componentPath) {
      const proxyConfig = await ConfigLoader.loadConfig(config.configPath);
      const transformHandlers = await loadHandlersFromConfig(proxyConfig);
      console.log("transformHandlers", transformHandlers);
      if (!fs2.existsSync(componentPath) || !fs2.statSync(componentPath).isDirectory()) {
        throw new Error(`Invalid component path: ${componentPath}`);
      }
      options.server.http(async (request, nextHandler) => {
        const { _nodeRequest: req, _nodeResponse: res } = request;
        const name = "myProxyHandler";
        console.log("name", name);
        const handler = await getHandler(name);
        await handler.handleRequest(req, res);
      });
      return true;
    }
  };
}
export {
  start
};
