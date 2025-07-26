export const $get = (ctx) => ctx.json({
    route: ctx.req.routePath,
    path: ctx.req.path,
    params: ctx.req.param(),
    method: ctx.req.method,
})
