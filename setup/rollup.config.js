import fileRoutes from "@axel669/rollup-hono-files"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

export default {
    input: "src/main.js",
    output: {
        file: "artifacts/main.js",
        format: "esm"
    },
    plugins: [
        fileRoutes({
            debug: true
        }),
        resolve(),
        commonjs(),
    ]
}
