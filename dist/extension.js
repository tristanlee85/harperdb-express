// src/extension.ts
import fs from "node:fs";
import path from "node:path";
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
  assertType("transformerPath", options.transformerPath, "string");
  return {
    transformerPath: options.transformerPath ?? ""
  };
}
function start(options) {
  const config = resolveConfig(options);
  logInfo(`Starting extension...`);
  return {
    async handleDirectory(_, componentPath) {
      let transformReqFn;
      let transformResFn;
      if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
        throw new Error(`Invalid component path: ${componentPath}`);
      }
      if (!!config.transformerPath) {
        const importPath = path.resolve(componentPath, config.transformerPath);
        if (!fs.existsSync(importPath) || !fs.statSync(importPath).isFile()) {
          throw new Error(`Invalid transformer path: ${importPath}`);
        }
        const { transformRequest, transformResponse } = await import(importPath);
        transformReqFn = transformRequest;
        transformResFn = transformResponse;
      }
      options.server.http(async (request, nextHandler) => {
        const { _nodeRequest: req, _nodeResponse: res } = request;
        const { transformRequest, transformResponse } = request.edgio?.proxyHandler ?? {};
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
