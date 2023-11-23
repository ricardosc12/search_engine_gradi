export function genresParse(games) {
    const genres = {}


    games.forEach(game => {
        if (game.genres) {
            game.genres.split(',').forEach(lg => {
                genres[lg] = lg
            })
        }
    })

    return genres
}