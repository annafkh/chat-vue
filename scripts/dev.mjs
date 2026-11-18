import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)

// WebContainers can run the WebAssembly CLI through Node without a native binary.
if (process.versions.webcontainer && !process.env.ESBUILD_BINARY_PATH) {
  process.env.ESBUILD_BINARY_PATH = require.resolve('esbuild-wasm/bin/esbuild')
}

const vitePackage = pathToFileURL(require.resolve('vite/package.json'))
await import(new URL('./bin/vite.js', vitePackage))
