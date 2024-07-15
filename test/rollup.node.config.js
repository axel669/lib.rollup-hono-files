import fileRoutes from "@axel669/rollup-hono-files"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "node.js",
    output: {
        file: "out/server.js",
        format: "esm"
    },
    plugins: [
        fileRoutes,
        resolve()
    ]
}
