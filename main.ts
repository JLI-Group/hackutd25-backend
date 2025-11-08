import { MongoClient } from 'npm:mongodb@6.1.0'

Deno.serve((_req) => {
    return new Response('Hello, World!')
})
