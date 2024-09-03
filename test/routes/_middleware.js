export const $get = async (ctx, next) => {
    console.log("GET middlware")
    return await next()
}

export const $any = [
    async (ctx, next) => {
        console.log("ANY middleware")
        return await next()
    }
]
