const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://root:toor@127.0.0.1:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        // await createCollection(client, 'myDatabase', 'myCollection');
        console.log("CONNECTED")
        // await createDocument(client, 'myDatabase', 'myCollection', { name: "Item1", value: 100 });
        // await createDocument(client, 'myDatabase', 'myCollection', { name: "Item2", value: 200 });

        await findDocuments(client, 'myDatabase', 'myCollection');
        // await updateDocument(client, 'myDatabase', 'myCollection', { name: "Item1" }, { $set: { value: 150 } });

        // await deleteDocument(client, 'myDatabase', 'myCollection', { name: "Item2" });

    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function createCollection(client, dbName, collectionName) {
    const result = await client.db(dbName).createCollection(collectionName);
    console.log(`Collection ${collectionName} created in ${dbName}`);
}

async function createDocument(client, dbName, collectionName, document) {
    const result = await client.db(dbName).collection(collectionName).insertOne(document);
    console.log(`New document created with the following id: ${result.insertedId}`);
}

async function findDocuments(client, dbName, collectionName) {
    const cursor = await client.db(dbName).collection(collectionName).find();
    const results = await cursor.toArray();
    console.log("Found documents:", results);
}

async function updateDocument(client, dbName, collectionName, filter, update) {
    const result = await client.db(dbName).collection(collectionName).updateOne(filter, update);
    console.log(`Document updated: ${result.modifiedCount}`);
}

async function deleteDocument(client, dbName, collectionName, filter) {
    const result = await client.db(dbName).collection(collectionName).deleteOne(filter);
    console.log(`Document deleted: ${result.deletedCount}`);
}