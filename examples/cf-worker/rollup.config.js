import fileRoutes from "@axel669/hono-file-routes"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "main.js",
    output: {
        file: "artifacts/worker.js",
        format: "esm"
    },
    plugins: [
        fileRoutes({
            debug: true
        }),
        resolve()
    ]
}
