require('dotenv').config({ path: ".env.test" })
import { ObjectId } from 'mongodb';

import { Client as ElastClient } from '@elastic/elasticsearch';

const elasticClient = new ElastClient({ node: 'http://localhost:9200' });

const shrinkRay = require('shrink-ray-current');

import express from 'express';
import bodyParser from 'body-parser'
import { RepositoryController } from './repositories/controller';

const app = express();
const port = process.env.PORT;

app.use(express.json(), shrinkRay(), bodyParser.json());

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
            name: { $all: [/Train/] }
            // languages: { $all: [/French/] }
        }).project({ name: 1 })


        const games = await cursor.toArray();

        res.status(201).json(games);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/game', async (req, res) => {

    const { name } = req.query

    // const response = await elasticClient.search({
    //     index: 'jogos',
    //     query: {
    //         bool: {
    //             should: [
    //                 {
    //                     fuzzy: {
    //                         name: name as string
    //                     },
    //                 },
    //                 {
    //                     wildcard: {
    //                         name: (name as string) + '*'
    //                     }
    //                 }
    //             ]
    //         }
    //     }
    // })
    const response = await elasticClient.search({
        query: {
            function_score: {
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    "name.standard": {
                                        query: name as string,
                                        fuzziness: "AUTO",
                                        boost: 50
                                    }
                                }
                            },
                            {
                                match: {
                                    name: {
                                        query: name as string,
                                        fuzziness: "AUTO",
                                    }
                                }
                            }
                        ]
                    }
                },
                functions: [
                    {
                        filter: {
                            match: {
                                name: {
                                    query: name as string,
                                }
                            }
                        },
                        field_value_factor: {
                            field: "positive",
                            factor: 0.001,
                        }
                    },
                ],
                score_mode: "sum",
                boost_mode: "multiply"
            }
            // match: {
            //     name: {
            //         query: name as string,
            //         fuzziness: "AUTO"
            //     }
            // }
            // match: {
            //     "name.standard": {
            //         query: name as string,
            //         fuzziness: "AUTO"
            //     }

            // }
        }

    })
    // const response = await elasticClient.search({
    //     index: 'jogos',
    //     size: 15,
    //     from: 0,
    //     query: {
    //         function_score: {
    //             query: {
    //                 match: {
    //                     name: {
    //                         query: name as string,
    //                         fuzziness: "AUTO"
    //                     }
    //                 }
    //             },
    //             functions: [
    //                 {
    //                     filter: {
    //                         match: {
    //                             name: {
    //                                 query: name as string,
    //                             }
    //                         }
    //                     },
    //                     field_value_factor: {
    //                         field: "positive",
    //                         factor: 0.01,
    //                         modifier: 'ln2p'

    //                     }
    //                 },
    //                 // {
    //                 //     filter: {
    //                 //         match: {
    //                 //             name: {
    //                 //                 query: name as string,
    //                 //                 fuzziness: "AUTO"
    //                 //             }
    //                 //         }
    //                 //     },
    //                 //     field_value_factor: {
    //                 //         field: "recommendations",
    //                 //         factor: 0.01
    //                 //     }
    //                 // }
    //             ],
    //             score_mode: "sum",
    //             boost_mode: "multiply"
    //         }

    //     },
    // });
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
        res.status(200).json(await bulkGames())
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function bulkGames() {

    const cursor = await repository.getDb("steam").collection("games")
        .find()
        .project({ name: 1, image: 1, positive: 1, recommendations: 1 })

    const games = await cursor.toArray();

    const bulkGames = games.map(game => ({
        id: game._id,
        name: game.name,
        image: game.image,
        positive: game.positive,
        recommendations: game.recommendations
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
                        }
                    },
                    tokenizer: {
                        game_token_autocomplete: {
                            type: 'edge_ngram',
                            min_gram: 2,
                            max_gram: 10,
                            token_chars: ['letter', 'digit', 'whitespace', `punctuation`]
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    id: { type: 'text' },
                    name: {
                        type: 'text',
                        analyzer: 'game_analyzer_complete',// Utilizando o analyzer customizado
                        fields: {
                            standard: {
                                type: 'text', // Multi-field usando o analisador padrão
                                analyzer: 'custom_standanr'
                            }
                        }
                    },
                    image: {
                        type: 'text',
                        index: false // Campo não será indexado
                    },
                    positive: {
                        type: 'integer'
                    },
                    recommendations: {
                        type: 'integer'
                    }
                }
            }
        }
    });
};