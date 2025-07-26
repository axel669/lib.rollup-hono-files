export const $any = async (ctx, next) => {
    console.log("GET /nested middleware")
    return await next()
}
