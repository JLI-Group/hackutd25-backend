import { MongoClient } from 'npm:mongodb@6.1.0'
import { load } from 'jsr:@std/dotenv'

const env = await load({
    envPath: '.env',
    // optional: also export to the process environment (so Deno.env can read it)
    export: true,
})

const client = new MongoClient(Deno.env.get('MONGO_CONNECTION')!)

await client.connect()

Deno.serve((_req) => {
    return new Response('Hello, World!')
})

client.close();
