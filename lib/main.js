import path from "node:path"

import glob from "fast-glob"

const fileUtils = `
import { Hono } from "hono"

const app = new Hono()
const verbs = [
    "$get",
    "$post",
    "$patch",
    "$put",
    "$delete",
    "$options",
    "$head",
]
const addRoute = (pattern, module) => {
    for (const verb of verbs) {
        const handler = module[verb]
        if (handler !== undefined) {
            const handlerList = Array.isArray(handler) ? handler : [handler]
            optlog("add", pattern, verb, handlerList.length)
            for (const handler of handlerList) {
                app.on(verb.slice(1), pattern, handler)
            }
        }
    }
    if (module.$any === undefined) {
        return
    }
    const handlerList = Array.isArray(module.$any) ? module.$any : [module.$any]
    optlog("add", pattern, "any", handlerList.length)
    for (const handler of handlerList) {
        app.use(pattern, handler)
    }
}
const optlog = (...args) => {
    if (options.debug !== true) {
        return
    }
    console.log(...args)
}
`
/**
@param {ImportTarget[]} fileList
@param {function(ImportTarget): bool} filter
@param {function(ImportTarget): string} makeRoute
@return {string}
*/
const processRoutes = (fileList, filter, makeRoute) => {
    const filtered = fileList.filter(filter)
    const routes = []
    for (const info of filtered) {
        const route = makeRoute(info)
        routes.push(
            `addRoute(${JSON.stringify(route)}, ${info.varname})`
        )
    }
    return routes
}

/**
@param {Object} options
@param {bool} options.debug Turns on debug logs. Default is off.
@return {RollupPlugin}
*/
export default (options = {}) => ({
    resolveId(id, parent) {
        if (id.endsWith("!routes") === false) {
            return
        }
        const target = path.resolve(
            path.dirname(parent),
            id.slice(0, -7)
        )
        return `${target}!routes`
    },
    async load(file) {
        if (file.endsWith("!routes") === false) {
            return
        }

        const root = file.slice(0, -7)
        const files = await glob.async(
            "**/*.{js,mjs}",
            {
                onlyFiles: true,
                cwd: root,
            }
        )
        const fileList = files.map(
            (file, index) => {
                const filedir = path.dirname(file)
                const pathdir = (filedir === ".") ? "" : filedir
                const filename = path.basename(file)
                const name = path.basename(file, path.extname(filename))
                const pattern = `${pathdir}/${name}`
                return {
                    url: path.resolve(root, file).replaceAll("\\", "\\\\"),
                    dir: pathdir,
                    wildcard: name.startsWith("[["),
                    param: /\[.+?\]/.test(pattern),
                    pattern,
                    name,
                    filename,
                    varname: `route${index}`
                }
            }
        )

        const imports = fileList.map(
            (info) => {
                return `import * as ${info.varname} from "${info.url}"`
            }
        )
        const routeCode = [
            processRoutes(
                fileList,
                file => file.name === "_middleware",
                file => `${file.dir}/*`
            ),
            // static routes
            processRoutes(
                fileList,
                file => file.param === false && file.name !== "_middleware",
                file => file.pattern
            ),
            // parameterized routes
            processRoutes(
                fileList,
                file => file.param === true && file.wildcard === false,
                file => file.pattern.replace(
                    /\[(.+?)\]/,
                    (_, paramName) => `:${paramName}`
                )
            ),
            // wildcard routes
            processRoutes(
                fileList,
                file => file.wildcard === true,
                file => `${file.dir}/*`
            )
        ].flat()

        const code = [
            imports.join("\n"),
            fileUtils,
            `const options = ${JSON.stringify(options, null, 4)}`,
            routeCode.join("\n"),
            "export default app",
        ].join("\n")

        return code
    }
})
