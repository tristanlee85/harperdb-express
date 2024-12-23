# HarperDB Proxy Transform

A [HarperDB Component](https://docs.harperdb.io/docs/developers/components) for proxying upstream requests to an origin server.

## Usage

1. Add this extension to your HarperDB project using your package manager:

```sh
npm install git+ssh://git@github.com:Solara6/harperdb-proxy-transform.git --save
# or
yarn add git+ssh://git@github.com:Solara6/harperdb-proxy-transform.git
# or
pnpm add git+ssh://git@github.com:Solara6/harperdb-proxy-transform.git
```

2. Add to `config.yaml`:

```yaml
'harperdb-proxy-transform':
  package: 'harperdb-proxy-transform'
  files: /*
  # configPath: edgio.proxy.config.js
```

3. Run your app with HarperDB:

```sh
harperdb run .
```

### Extension Options

```ts
interface ExtensionOptions {
	configPath: string;
}
```

- `configPath`: The path to the `edgio.proxy.config.js` file. This file contains the proxy/compute handlers to be used. See [edgio.proxy.config.js](./edgio.proxy.config.js) for an example.

## Building

This extension is built using [`Bun`](https://bun.sh). To get started, install Bun globally:

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
