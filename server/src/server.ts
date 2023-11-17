require('dotenv').config({ path: ".env.test" })
import { ObjectId } from 'mongodb';

import { SchemaFieldTypes, createClient } from 'redis';

const client = createClient();

const shrinkRay = require('shrink-ray-current');

import express from 'express';
import { RepositoryController } from './repositories/controller';

const app = express();
const port = process.env.PORT;

app.use(express.json(), shrinkRay());

const repository = new RepositoryController(process.env.DATABASE_URI)

repository.connect().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
})

async function createIndexes() {

    repository.getDb("steam").collection("games").createIndex({
        name: "text",
        description: "text",
        languages: "text",
        developers: "text",
        publishers: "text",
        categories: "text",
        genres: "text",
    })


    // repository.getDb("steam").collection("games").createIndex({ languages: 'text' })
}


client.on('error', err => console.log('Redis Client Error', err));

client.connect();

app.post('/users', async (req, res) => {
    try {
        // const cursor = await repository.getDb("steam").collection("games").find().limit(2)
        // createIndexes()
        // const cursor = await repository.getDb("steam").collection("games").find({
        //     $or: [
        //         {
        //             $text: {
        //                 $search: "Perpetual"
        //             }
        //         }
        //     ]
        // })

        // const cursor = await repository.getDb("steam").collection("games").find(
        //     {
        //         $text: { $search: "Spider" },
        //         languages: {
        //             $all: [/Vietnamese/, /Finnish/]
        //         },
        //         publishers: "Laush Studio"
        //     }
        // )

        const cursor = await repository.getDb("steam").collection("games").find({
            // _id: {
            //     $in: [
            //         new ObjectId("6556b76eda4b945a9fd1fe08"),
            //         new ObjectId("6556b76eda4b945a9fd1fe09")
            //     ]
            // },
            name: {$all: [/Train/]}
            // languages: { $all: [/French/] }
        }).project({ name: 1 })


        const games = await cursor.toArray();

        res.status(201).json(games);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/sonic', async (req, res) => {
    try {
        const cursor = await repository.getDb("steam").collection("games").find().project({ name: 1 })
        const games = await cursor.toArray();

        // await Promise.all(games.map(game =>
        //     client.hSet(`noderedis:names:${game._id.toString()}`, { name: game.name }),
        // ))
        // res.status(200).json(games.slice(0, 5))
        // client.hSet("name:1",{
        //     name: "Train Robot"
        // })
        // try {
        //     // Documentation: https://redis.io/commands/ft.create/
        //     await client.ft.create('idx:names', {
        //         name: {
        //             type: SchemaFieldTypes.TEXT,
        //             SORTABLE: true
        //         }
        //     }, {
        //         ON: 'HASH',
        //         PREFIX: 'noderedis:names'
        //     });
        // } catch (e) {
        //     if (e.message === 'Index already exists') {
        //         console.log('Index exists already, skipped creation.');
        //     } else {
        //         // Something went wrong, perhaps RediSearch isn't installed...
        //         console.error(e);
        //         process.exit(1);
        //     }
        // }

        // await Promise.all([
        //     client.hSet('noderedis:names:1', { name: 'Fluffy' }),
        //     client.hSet('noderedis:names:2', { name: 'Ginger' }),
        //     client.hSet('noderedis:names:3', { name: 'Rover' }),
        //     client.hSet('noderedis:names:4', { name: 'Fido' })
        // ]);
        const results = await client.ft.search(
            'idx:names',
            '@name:%Fluf%'
        );

        // const result2 = await client.scan(2, {
        //     TYPE: 'hash'
        // });


        res.status(200).json(results)
    } catch (error) {
        res.status(500).send(error.message);
    }
});



