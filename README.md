# HarperDB Proxy Transform

A [HarperDB Component](https://docs.harperdb.io/docs/developers/components) for proxying Edgio requests to an origin server.

## Usage

1. Add this extension to your HarperDB project using your package manager:

```sh
npm install git+ssh://git@github.com:tristanlee85/harperdb-proxy-transform.git --save
# or
yarn add git+ssh://git@github.com:tristanlee85/harperdb-proxy-transform.git
# or
pnpm add git+ssh://git@github.com:tristanlee85/harperdb-proxy-transform.git
```

2. Add to `config.yaml`:

```yaml
'harperdb-proxy-transform':
  package: 'harperdb-proxy-transform'
  files: /*
  outputDir: ./handlers
  defaultOrigin: origin
  handlers:
    myComputeHandler:
      type: compute
      path: 'src/handlers/myComputeHandler.ts'
      always: true # optional, defaults to false
    myProxyHandler:
      type: proxy
      path: 'src/handlers/myProxyHandler.ts'
      origin: origin
```

3. Bundle the handlers:

```sh
npx hdb-proxy bundle
```

4. Run your app with HarperDB:

```sh
harperdb run .
```

### Component Options

- `edgioConfigPath`: The path to the `edgio.config.js` file.
- `outputDir`: The directory to output the generated handlers to.
- `defaultOrigin`: The origin to use if no origin is specified in the request.
- `handlers`: The handlers to be used.
- `handlers[name]`: The handler to be used.
- `handlers[name].type`: The type of handler to be used (`compute` or `proxy`).
- `handlers[name].path`: The path to the handler file to be bundled.
- `handlers[name].always`: Whether the handler should be applied to all requests.
- `handlers[name].origin`: The origin to use for the handler (only applies to `proxy` handlers).

## Handlers

Handlers are the core of this component. They are the functions that will be used to transform the request and response
of a proxied request, or to perform a compute operation.

### Handler Types

- `compute`: A compute handler is a function that will be invoked for a given request. It can be used to write to the
  provided response, or to perform a compute operation such as setting request headers, or modifying the request body.
  This file must export a default function that takes a `request` and `response` as arguments.

  ```js
  export default async function computeHandler(request, response) {
  	// ...
  }
  ```

- `proxy`: A proxy handler allows you to define transformations to the request and response of a proxied request.
  This handler may export a `transformRequest` function that will be used to transform the request before it is sent to the origin server.
  It may also export a `transformResponse` function that will be used to transform the response after it is received from the origin server. If the handler has a default export, it will be used as the `transformResponse` function.

  ```js
  // src/handlers/myProxyHandler.ts
  export default async function proxyHandler(response, request, rawBody) {
  	// This handler will be used to transform the response after it is received from the origin server.
  	// ...
  }

  // src/handlers/myOtherProxyHandler.ts
  export async function transformRequest(request) {
  	// This handler will be used to transform the request before it is sent to the origin server.
  	// ...
  }

  export async function transformResponse(response, request, rawBody) {
  	// This handler will be used to transform the response after it is received from the origin server.
  	// ...
  }
  ```

## Bundling

This component uses [`Bun`](https://bun.sh) to bundle the handlers that will be used for
compute and proxying requests, including any transformations to the request or response.

To bundle the handlers, run the following command:

```sh
npx hdb-proxy bundle
```

This will infer the handlers to be used from the `config.yaml` file, and bundle them into the `outputDir` directory.

### Bundling Options

- `-o, --out`: The directory to output the generated handlers to.
- `-f, --format`: The format of the bundle (`esm` or `cjs`).

## Building

This component is built using [`Bun`](https://bun.sh). To get started, install Bun globally:

```sh
npm install -g bun
```

Then, run the following command to build the extension:

```sh
bun run build
```

This will create a `dist` directory with the built extension bundled for Node.js.

If you are developing, you can use the `watch` script to automatically rebuild the extension when you make changes to the source code.

```sh
bun run watch
```
