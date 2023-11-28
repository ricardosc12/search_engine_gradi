require('dotenv').config({ path: ".env.test" })
import { ObjectId } from 'mongodb';

import { Client as ElastClient } from '@elastic/elasticsearch';

const elasticClient = new ElastClient({ node: 'http://localhost:9200' });

const shrinkRay = require('shrink-ray-current');

import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import { RepositoryController } from './repositories/controller';
import { filterGame } from './cases/Game/filter';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT;

app.use(express.json(), shrinkRay(),
    bodyParser.json(), cors()
);

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

app.post('/remove', async (req, res) => {

    const { id } = req.body

    if (!id) {
        res.status(400).json("SEM ID")
    }

    const result = await elasticClient.search({
        query: {
            match: {
                id: id
            }
        }
    })

    if (!result.hits.total) {
        res.status(204).json("OK")
    }

    await repository.getDb("steam")
        .collection("games")
        .deleteOne({ _id: new ObjectId(id) })

    const resp = await elasticClient.delete({
        index: 'jogos',
        id: result.hits.hits[0]._id
    })

    res.status(200).json(resp)
})

app.get('/lib', async (req, res) => {

    const cursor = await repository.getDb('steam')
        .collection("user").find();

    const games = await cursor.toArray();

    const cursor2 = await repository.getDb('steam')
        .collection('games').find({
            _id: {
                $in: games.map(game => new ObjectId(game.game))
            }
        })

    const game2 = await cursor2.toArray();
    res.status(200).json(game2.map(game => ({ id: game._id, ...game })))
})

app.post('/pub', async (req, res) => {

    const { languages, categories, genres,
        recommendations, positive, price, ...rest } = req.body

    const game = {
        languages: languages.join(','),
        categories: categories.join(','),
        genres: genres.join(','),
        recommendations: parseInt(recommendations),
        positive: parseInt(positive),
        price: parseFloat(price),
        ...rest,
    }

    const resultado = await repository.getDb("steam")
        .collection("games")
        .insertOne(game)

    if (!resultado.insertedId) res.status(500).json("ERROR")

    try {
        const document = {
            id: String(resultado.insertedId),
            ...game
        }

        delete document._id

        const elasticResponse = await elasticClient.index({
            index: 'jogos',
            document: document
        })

        await repository.getDb("steam").collection("user")
            .insertOne({
                game: resultado.insertedId
            })

        return res.status(200).json(elasticResponse)
    }
    catch (e) {
        await repository.getDb("steam")
            .collection("games")
            .deleteOne({ _id: new ObjectId(resultado.insertedId) })

        return res.status(500).json("ERROR")
    }

})

app.post('/users', async (req, res) => {
    try {

        const cursor = await repository.getDb("steam").collection("games")
            .find({})
            // .project({ genres: 1 })
            .limit(5)

        const games = await cursor.toArray();

        res.status(201).json(Object.values(games));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/best", async (req, res) => {
    const response = await elasticClient.search({
        size: 5,
        query: {
            function_score: {
                functions: [
                    {
                        field_value_factor: {
                            field: "positive",
                            factor: 1,
                            modifier: "ln2p"
                        }
                    },
                ],
                score_mode: "sum",
                boost_mode: "multiply"
            },
        }
    })

    //@ts-ignore
    const total = response.hits.total.value

    if (!total) {
        return res.status(204).json('ok')
    }

    const games = response.hits.hits.map(game => game._source)

    return res.status(200).json(games)
})

app.get('/game', async (req, res) => {

    const { name, size, ...extra } = req.query

    //@ts-ignore
    const filters = filterGame(extra)

    if (!name && !filters[0].bool.must.length) {
        return res.status(204).json([])
    }

    let bool = {};
    if (!name && filters.length) {
        bool = {
            must: filters
        }
    }
    else {
        bool = {
            ...(name) && {
                must: {
                    bool: {
                        should: [
                            {
                                match: {
                                    "name.standard": {
                                        query: name as string,
                                        fuzziness: 1,
                                        boost: 5
                                    }
                                }
                            },
                            {
                                match: {
                                    name: {
                                        query: name as string,
                                        fuzziness: 1,
                                    }
                                }
                            }
                        ]
                    }
                },
            },
            ...(filters.length) && {
                filter: filters
            }
        }
    }

    const response = await elasticClient.search({
        size: Number(size) || 10,
        query: {
            function_score: {
                query: {
                    bool: bool
                },
                functions: [
                    {
                        ...name && {
                            filter: {
                                match: {
                                    name: {
                                        query: name as string,
                                    }
                                }
                            },
                        },
                        field_value_factor: {
                            field: "positive",
                            factor: 0.001,
                            modifier: "ln2p"
                        }
                    },
                ],
                score_mode: "sum",
                boost_mode: "multiply"
            },

        }
    })

    //@ts-ignore
    const total = response.hits.total.value

    if (!total) {
        return res.status(204).json('ok')
    }

    const games = response.hits.hits.map(game => game._source)

    return res.status(200).json(games)
})

app.post('/sonic', async (req, res) => {
    try {

        // const count = await elasticClient.count({ index: 'jogos' })


        //LISTING

        // const count = await elasticClient.count({ index: 'jogos' })

        //SEARCH

        // const result2 = await deleteAllByIndex('jogos')
        // const result = await elasticClient.search({
        //     query: { match_all: {} }
        // })
        await createIndex2()

        await bulkGames()

        res.status(200).json('ok')
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function bulkGames() {

    const cursor = await repository.getDb("steam").collection("games")
        .find()
        .project({
            name: 1,
            image: 1,
            positive: 1,
            recommendations: 1,
            languages: 1,
            categories: 1,
            genres: 1,
            developers: 1,
            publishers: 1,
            release_date: 1,
            price: 1
        })

    const games = await cursor.toArray();

    const bulkGames = games.map(game => ({
        id: game._id,
        name: game.name,
        image: game.image,
        positive: game.positive,
        recommendations: game.recommendations,
        languages: game.languages,
        categories: game.categories,
        genres: game.genres,
        developers: game.developers,
        publishers: game.publishers,
        release_date: game.release_date,
        price: game.price
    }))

    const operations = bulkGames.flatMap(doc => [{ index: { _index: 'jogos' } }, doc])

    return await elasticClient.bulk({ refresh: true, operations })
}

async function deleteAllByIndex(index: string) {
    return await elasticClient.deleteByQuery({
        index: index,
        query: { match_all: {} }
    });
}

async function getAllIndex() {
    const response = await elasticClient.cat.indices({ format: 'json' });
    return response;
}

async function deleteIndex(index: string) {
    return await elasticClient.indices.delete({ index: index });
}

async function createIndex() {

    return await elasticClient.indices.create({
        index: 'jogos',
        body: {
            mappings: {
                properties: {
                    id: { type: 'text' },
                    name: { type: 'text' },
                    image: {
                        type: 'text',
                        index: false
                    }
                }
            }
        }
    })
}

const createIndex2 = async () => {
    return await elasticClient.indices.create({
        index: 'jogos',
        body: {
            settings: {
                analysis: {
                    analyzer: {
                        game_analyzer_complete: {
                            type: 'custom',
                            tokenizer: 'game_token_autocomplete',
                            filter: ['lowercase', 'asciifolding']
                        },
                        custom_standanr: {
                            type: 'custom',
                            tokenizer: 'standard',
                            filter: ['lowercase', 'asciifolding']
                        },
                        tags_analyzer: {
                            type: 'custom',
                            tokenizer: 'tags_tokenizer',
                            filter: ['lowercase', 'asciifolding', 'trim']
                        }
                    },
                    tokenizer: {
                        game_token_autocomplete: {
                            type: 'edge_ngram',
                            min_gram: 2,
                            max_gram: 10,
                            token_chars: ['letter', 'digit', 'whitespace', `punctuation`]
                        },
                        tags_tokenizer: {
                            type: 'pattern',
                            pattern: ','
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    id: { type: 'text' },
                    name: {
                        type: 'text',
                        analyzer: 'game_analyzer_complete',
                        fields: {
                            standard: {
                                type: 'text',
                                analyzer: 'custom_standanr'
                            }
                        }
                    },
                    image: {
                        type: 'text',
                        index: false
                    },
                    positive: {
                        type: 'integer'
                    },
                    recommendations: {
                        type: 'integer'
                    },
                    languages: {
                        type: 'text',
                        analyzer: 'tags_analyzer'
                    },
                    categories: {
                        type: 'text',
                        analyzer: 'tags_analyzer'
                    },
                    genres: {
                        type: 'text',
                        analyzer: 'tags_analyzer'
                    },
                    developers: {
                        type: 'text',
                        analyzer: "tags_analyzer"
                    },
                    publishers: {
                        type: 'text',
                        analyzer: "tags_analyzer"
                    },
                    release_date: {
                        type: 'date',
                        format: 'yyyy-MM-dd'
                    },
                    price: {
                        type: "float"
                    }
                }
            }
        }
    });
};


