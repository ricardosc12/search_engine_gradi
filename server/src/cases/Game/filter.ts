export function filterGame({
    languages,
    categories,
    genres,
    developers,
    publishers,
    ano
}) {
    let filters_tag = []

    if (languages) {
        filters_tag = filters_tag.concat((languages as string).split(',').map(lg => ({ match: { languages: lg } })))
    }

    if (categories) {
        filters_tag = filters_tag.concat((categories as string).split(',').map(ct => ({ match: { categories: ct } })))
    }

    if (genres) {
        filters_tag = filters_tag.concat((genres as string).split(',').map(gr => ({ match: { genres: gr } })))
    }

    if (developers) {
        filters_tag.push({
            match: {
                developers: developers
            }
        })
    }

    if (publishers) {
        filters_tag.push({
            match: {
                publishers: publishers
            }
        })
    }

    let filters = []

    if (filters_tag) {
        filters.push({
            bool: {
                must: filters_tag
            }
        })
    }

    if (ano) {
        filters.push({
            range: {
                release_date: {
                    gte: `${ano}-01-01`, // Início de 2023
                }
            }
        })
    }

    return filters
}