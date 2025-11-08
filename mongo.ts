const env = await load({
    envPath: '.env',
    // optional: also export to the process environment (so Deno.env can read it)
    export: true,
})

export const client = new MongoClient(Deno.env.get('MONGO_CONNECTION')!)


//#region Example Functions
async function exampleInsert() {
    await client.connect()
    const db = client.database('test_db')
    const collection = db.collection('test_collection')
    const insertResult = await collection.insertOne({ name: 'example', value: 42 })
    console.log('Inserted document with _id:', insertResult)
    await client.close()
}
//#endregion

//#region Mongo Methods
//#endregion