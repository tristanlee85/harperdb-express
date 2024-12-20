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
  # transformerPath: transforms.js # default ''
```

3. Run your app with HarperDB:

```sh
harperdb run .
```

### Extension Options

```ts
interface ExtensionOptions {
	transformerPath?: string;
}
```

- `transformerPath`: The path to the transformer file. This file contain named exports that will be used to transform the request and response. See [transformer.js](./transformer.js) for an example.

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
