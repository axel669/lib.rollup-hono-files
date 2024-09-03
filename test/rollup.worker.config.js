import fileRoutes from "@axel669/rollup-hono-files"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "worker.js",
    output: {
        file: "worker/main.js",
        format: "esm"
    },
    plugins: [
        fileRoutes({
            debug: true
        }),
        resolve()
    ]
}
