import fileRoutes from "@axel669/rollup-hono-files"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "main.js",
    output: {
        file: "artifacts/server.js",
        format: "esm"
    },
    plugins: [
        fileRoutes({
            debug: true
        }),
        resolve()
    ]
}
