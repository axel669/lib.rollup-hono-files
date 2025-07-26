// @ts-check
/** @import * as lib from "./types.ts" */
import path from "node:path"
import glob from "fast-glob"

import scriptBase from "./script-base.js"

const libPrefix = "file-routes@"

/** @type {(options?: lib.FileRouteOptions) => lib.RollupPlugin} */
export default (options) => {
    /** @type {lib.FileRouteOptions} */
    const opt = {
        debug: false,
        ...options,
    }
    return {
        resolveId(id, parent) {
            if (id.startsWith(libPrefix) === false) {
                return
            }
            const target = path.resolve(
                path.dirname(parent),
                id.slice(libPrefix.length)
            )
            return `${libPrefix}${target}`
        },
        async load(file) {
            if (file.startsWith(libPrefix) === false) {
                return
            }

            const root = file.slice(libPrefix.length)
            const files = await glob.async(
                "**/*.{js,mjs}",
                {
                    onlyFiles: true,
                    cwd: root,
                }
            )
            /** @type {lib.Route[]} */
            const routeInfo = files.map(
                (file, index) => {
                    const filedir = path.dirname(file)
                    const pathdir = (filedir === ".") ? "" : filedir
                    const filename = path.basename(file)
                    const name = path.basename(file, path.extname(filename))
                    const pattern = `${pathdir}/${name}`

                    const url = JSON.stringify(
                        path.resolve(root, file)
                    )
                    const wildcard = /^\[\[.+\]\]$/.test(name)
                    const param = /\[.+?\]/.test(pattern)
                    const varname = `route${index}`

                    if (name === "_middleware") {
                        return {
                            type: "middleware",
                            route: `${pathdir}/*`,
                            url, varname,
                        }
                    }
                    if (param === false) {
                        return {
                            type: "static",
                            route: pattern,
                            url, varname,
                        }
                    }
                    if (wildcard === false) {
                        return {
                            type: "params",
                            route: pattern.replace(
                                /\[(.+?)\]/,
                                (_, paramName) => `:${paramName}`
                            ),
                            url, varname,
                        }
                    }
                    return {
                        type: "wildcard",
                        route: `${pathdir}/*`,
                        url, varname,
                    }
                }
            )

            const imports = routeInfo.map(
                (info) => {
                    return `import * as ${info.varname} from ${info.url}`
                }
            )
            // Process the different kinds of routes in a specific order because
            // Hono will go through in the order routes are added when
            // attempting to match. Middleware routes are always added first
            // because they need to run before any actual matched route.
            const orderedRoutes = [
                ...routeInfo.filter(info => info.type === "middleware"),
                ...routeInfo.filter(info => info.type === "static"),
                ...routeInfo.filter(info => info.type === "params"),
                ...routeInfo.filter(info => info.type === "wildcard"),
            ]
            const routeCode = orderedRoutes.map(
                info => {
                    const args = [
                        JSON.stringify(info.route),
                        info.varname,
                        JSON.stringify(info.type),
                    ]
                    return `addRoute(${args.join(", ")})`
                }
            )

            const codeChunks = [
                imports.join("\n"),
                scriptBase,
                `const options = ${JSON.stringify(opt, null, 4)}`,
                routeCode.join("\n"),
                "export default app",
            ]

            return codeChunks.join("\n")
        }
    }
}
