import { searchGamebyName } from "@/api/game"
import { useDebouce } from "@/utils/debounce"
import { For, createSignal, onMount } from "solid-js"
import gitImage from '@/utils/steam.gif'

export function SearchGame() {

    const [games, setGames] = createSignal([])

    const handleSearchDebounce = useDebouce(handleSearch, 350)

    async function handleSearch(e: any) {
        const value = e.target.value

        const resp = await searchGamebyName(value)

        if (resp.status === 200) {
            setGames(resp.data)
        }

        else if (resp.status == 204) {
            setGames([])
        }

        console.log(resp)
    }

    return (
        <div class="flex flex-col items-center justify-center w-full">
            <input placeholder="Game" oninput={handleSearchDebounce} />

            <GamesList list={games()} />
        </div>
    )
}

interface GameProps {
    id: string;
    name: string;
    image: string;
}

interface GameListPros {
    list: Array<GameProps>
}

function GamesList(props: GameListPros) {
    return (
        <div class="flex flex-col">
            <For each={props.list}>
                {(game: GameProps) => {
                    return (
                        <div class="flex">
                            <LazyImage src={game.image} />
                            <p>{game.name}</p>
                        </div>
                    )
                }}
            </For>
        </div>
    )
}

function LazyImage({ src }: any) {

    const [image, setImage] = createSignal(gitImage)

    onMount(() => {
        let _image = new Image()
        _image.src = src
        _image.onload = () => [
            setImage(src)
        ]
    })

    return <img width='100' src={image()} alt="game image" />
}