type Expand<T> = {
    [K in keyof T]: T[K]
} & {}

export type FileRouteOptions = Expand<{
    debug: boolean
}>

export type RollupPlugin = Expand<{
    resolveId: (id: string, parent: string) => string | undefined
    load: (file: string) => Promise<string | undefined>
}>

export type Route = Expand<{
    type: "middleware" | "static" | "params" | "wildcard"
    url: string
    varname: string
    route: string
}>
