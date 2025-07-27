# Hono File Routes
A small library for adding file-based routing into hono routes at bundle time
using rollup. The goal was to bring file-based routing to places like Cloudflare
Workers and AWS Lambda with a simple, consistent interface.

## Installation
Available in the standard package managers
```bash
pnpm add @axel669/hono-file-routes
```

## Usage
1. Configure the plugin with rollup
2. Create the routes directory with the desired routes
3. Import the route directory into your code

The examples directory of the repo contains a NodeJS and a Cloudflare Workers
example that can be run, and a Bruno collection for each of the routes.

### Importing in Code
Importing with the `file-routes@` prefix on the directory to import will have
the plugin create a hono router from the routes in the directory. Normal import
resolution rules apply to the location (relative vs absolute file paths).
```js
import router from "file-routes@./routes"
```

### Rollup Config
```js
import fileRoutes from "@axel669/hono-file-routes"

export default {
    input: "main.js",
    output: {
        file: "your-output-file",
        format: "esm"
    },
    plugins: [
        fileRoutes({
            debug: true
        })
    ]
}
```
If `debug` is `true` the library will console.log information on what routes
are being imported and setup when the script begins.

### File Routes
There are 4 route types that can be defined by the files and their locations.
An example of the order these run is provided after all the descriptions.

In order for a file to register a route action, it needs to export variables
named `$<method>` and / or `$any`. Specific methods will always match before
`$any` handlers (ex: if `$get` matches, `$any` in the same file won't).

The exported value for any handlers should be either a function, or an array of
functions that are used as [Hono routing](https://hono.dev/docs/api/routing)
functions. If the exported value is an array, all the handlers are added for the
same route/verb in the order they appear in the array. Additionally, if any of
them in the list returns it will make the route return and not go to subsequent
handlers, just like
[middleware in Hono](https://hono.dev/docs/guides/middleware).

> The library doesn't modify how any of the
> [Hono context](https://hono.dev/docs/api/context) functions work, it just
> makes it easier to setup routes based on file paths, so all context functions
> are available as-is per the Hono docs.

#### Middleware
Middleware Routes are files named `_middleware.js` in a folder. Middleware runs
before any routes in a folder, in a top down fashion (examples later).

#### Wildcard Routes
Wildcard routes match any route not defined in a directory and are defined by
naming a file as `[[<name>]].js`.

#### Parameter Routes
Parameter routes are routes that have parameters in them and are defined by
naming a file or folder as `[<param name>]`. Any valid part of a path can match
against a parameter, and more than one parameter can exist on a route.

### Static routes
Any route that isn't formatted as one of the previous types will be
treated as a static route. The files and directories don't have any special
syntax required (other than being `.js` files).

### Routing Example
```
routes/
├─ dir/
│  ├─ _middleware.js
│  ├─ static.js
│  ├─ [[nested-wildcard]].js
├─ user/
│  ├─ _middleware.js
│  ├─ logout.js
│  ├─ [userID].js
├─ [param1]/
│  ├─ [param2]/
│  │  ├─ thing.js
│  ├─ [file-param].js
├─ _middleware.js
├─ [[no-route]].js
```

This set of files will generate the following Hono routes:
```
/dir/static
/dir/*
/user/logout
/user/:userID
/:param1/:file-param
/:param1/:param2/thing
/*
```
Routes are added to Hono in such a way that the resolution order is
always the same:
1. static routes
2. parameterized routes
3. wildcards

### Routing Resolution
Using the previous set of routes, this is what the execution will look
like given some example requests.

```
/dir/static
-> run /_middleware.js
-> run /dir/_middleware.js
-> match /dir/static.js

/dir/random-thing
-> run /_middleware.js
-> run /dir/_middleware.js
-> match /dir/[[nested-wildcard]].js

/user/logout
-> run /_middleware.js
-> run /user/_middleware.js
-> match /user/logout.js

/user/id-123
-> run /_middleware.js
-> run /user/_middleware.js
-> match /user/[userID].js

/user/not/valid
-> run /_middleware.js
-> run /user/_middleware.js
-> match /[[no-route]].js

/first/second/thing
-> run /_middleware.js
-> match /[param1]/[param2]/thing.js

/first/second
-> run /_middleware.js
-> match /[param1]/[file-param].js
```
