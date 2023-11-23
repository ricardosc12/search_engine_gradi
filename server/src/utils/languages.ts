export function languagesParse(games) {
    const languages = {}

    const conditions = [
        '\\r', '&', ',', '[b]',
        'text only', 'audio support', 'full audio',
        'English Dutch  English', ' Korean',
    ]

    games.forEach(game => {
        if (game.languages) {
            game.languages.split(', ').forEach(lg => {
                if (!conditions.some(el => lg.includes(el)) &&
                    lg[lg.length - 1] != '\''
                ) {
                    languages[lg] = lg
                }
            })
        }
    })

    return languages
}