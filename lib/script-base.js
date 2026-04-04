// This is the base of the script that gets bundled by rollup
/** @type {string} */
export default `
import { Hono } from "hono"

const optlog = (...args) => {
    if (options.debug !== true) {
        return
    }
    console.log(...args)
}

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
const addRoute = (pattern, module, routeType) => {
    const path =
        pattern.startsWith("/") === true
        ? pattern
        : \`/\${pattern}\`
    for (const verb of verbs) {
        const handler = module[verb]
        if (handler !== undefined) {
            const handlerList = Array.isArray(handler) ? handler : [handler]
            optlog("add", { path, verb, routeType, count: handlerList.length })
            for (const handler of handlerList) {
                app.on(verb.slice(1), path, handler)
            }
        }
    }
    if (module.$any === undefined) {
        return
    }
    const handlerList = Array.isArray(module.$any) ? module.$any : [module.$any]
    optlog("add", { path, verb: "any", routeType, count: handlerList.length })
    for (const handler of handlerList) {
        app.use(path, handler)
    }
}
`
