# Rollup Hono Files
A small library for adding file-based routing into hono routes at bundle time
using rollup. The goal was to bring file-based routing to places like Cloudflare
Workers and AWS Lambda with a simple, consistent interface.

## Installation
Available in the standard package managers
```bash
pnpm add @axel669/rollup-hono-files
```

## Usage
The library should be added as a plugin in the rollup config, in conjunction
with a specific change to imports in the code.

### Rollup Config
```js
import fileRoutes from "@axel669/rollup-hono-files"

export default {
    input: "main.js",
    output: {
        file: "build/app.js",
        format: "esm"
    },
    plugins: [
        // doesn't need a function call
        fileRoutes
    ]
}
```

### Import in Code
```js
import { serve } from "@hono/node-server"
import router from "./routes-dir!routes"

serve({
    fetch: router.fetch,
    port: 45067,
})
```
