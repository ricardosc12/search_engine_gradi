export function categoriesParse(games) {
    const categories = {}


    games.forEach(game => {
        if (game.categories) {
            game.categories.split(',').forEach(lg => {
                categories[lg] = lg
            })
        }
    })

    return categories
}