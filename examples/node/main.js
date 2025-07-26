import { serve } from "@hono/node-server"
import router from "file-routes@../routes"

serve({
    fetch: router.fetch,
    port: 45067,
})
