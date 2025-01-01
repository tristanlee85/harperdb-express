// src/extension.ts
import fs2 from "node:fs";
import assert from "node:assert";

// src/config.ts
import fs from "node:fs";
import path from "node:path";

class ConfigLoader {
  static _edgioConfig;
  static instance;
  static async loadConfig(configPath = "hdb-proxy.json") {
    configPath = path.resolve(process.cwd(), configPath);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file ${configPath} not found. Run 'hdb-proxy bundle' to generate it.`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return this.instance = config;
  }
  static async loadEdgioConfig() {
    return this._edgioConfig || (this._edgioConfig = (await import(path.resolve(process.cwd(), "edgio.config.js"))).default);
  }
}

// src/handlers.ts
import https from "node:https";
import http from "node:http";

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
var importedHandlers = new Map;
var handlerInstanceCache = new Map;

class BaseHandlerImpl {
  _handlerName;
  _handler;
  constructor(name, handler) {
    this._handlerName = name;
    this._handler = handler;
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
  constructor(handlerName, handler, originName) {
    super(handlerName, handler);
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
  constructor(name, handler) {
    super(name, handler);
  }
  async handleRequest(request, response) {
    this.handler(request, response);
  }
}
async function loadHandlersFromConfig(config) {
  const handlers = config.handlers;
  Object.entries(handlers).forEach(async ([name, options]) => {
    const { type, path: path2, origin } = options;
    const handler = await import(path2);
    switch (type) {
      case "proxy":
        handlerInstanceCache[name] = new ProxyHandlerImpl(name, handler, origin ?? "");
        break;
      case "compute":
        handlerInstanceCache[name] = new ComputeHandlerImpl(name, handler);
        break;
    }
  });
  return handlerInstanceCache;
}
async function getHandler(name) {
  const handler = handlerInstanceCache.get(name);
  if (!handler) {
    throw new Error(`Handler '${name}' not found`);
  }
  return handler;
}

// src/extension.ts
function assertType(name, option, expectedType) {
  if (option) {
    const found = typeof option;
    assert.strictEqual(found, expectedType, `${name} must be type ${expectedType}. Received: ${found}`);
  }
}
function resolveConfig(options) {
  assertType("configPath", options.configPath, "string");
  return {
    configPath: options.configPath ?? "hdb-proxy.json",
    edgioConfigPath: options.edgioConfigPath ?? "edgio.config.js"
  };
}
function start(options) {
  const config = resolveConfig(options);
  return {
    async handleDirectory(_, componentPath) {
      const proxyConfig = await ConfigLoader.loadConfig(config.configPath);
      await loadHandlersFromConfig(proxyConfig);
      console.log("handlers loaded");
      if (!fs2.existsSync(componentPath) || !fs2.statSync(componentPath).isDirectory()) {
        throw new Error(`Invalid component path: ${componentPath}`);
      }
      console.log("options", options.server);
      options.server.http(async (request, nextHandler) => {
        const { _nodeRequest: req, _nodeResponse: res } = request;
        console.log("request", request);
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
