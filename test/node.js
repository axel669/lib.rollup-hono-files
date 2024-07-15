// import { Hono } from "hono"
import { serve } from "@hono/node-server"
import router from "./routes!routes"

// console.log(router)

serve({
    fetch: router.fetch,
    port: 45067,
})
