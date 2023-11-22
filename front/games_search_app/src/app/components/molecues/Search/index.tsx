import { searchGamebyName } from "@/api/game"
import { useDebouce } from "@/utils/debounce"
import { For, createSignal, onMount } from "solid-js"
import gitImage from '@/utils/steam.gif'
import { GameProps } from "../../interfaces/game"
import { Input } from "../../atoms/Input"
import { FilterIcon, MagicIcon, SearchIcon } from "@/icons"
import { ToggleButton } from "../../atoms/ToggleButton"
import style from './style.module.css'

export function SearchGame() {

    const [games, setGames] = createSignal([])

    const handleSearchDebounce = useDebouce(handleSearch, 350)

    async function handleSearch(e: any) {
        const value = e.target.value

        const resp = await searchGamebyName(value)

        if (resp.status === 200) {
            setGames(resp.data)
        }

        else {
            setGames([])
        }
    }

    function handleFocus() {
        const el = document.getElementById("gamelist")
        if (el) {
            el.ariaChecked = "true"
        }
    }

    function handleBlur() {
        setTimeout(() => {
            const el = document.getElementById("gamelist")
            if (el) {
                el.ariaChecked = "false"
            }
        }, 100)
    }

    return (
        <div class="flex flex-row items-center justify-center relative">
            <Input id="game-input" icon={SearchIcon} placeholder="Game" oninput={handleSearchDebounce} onblur={handleBlur} onfocus={handleFocus} />
            <ToggleButton class="ml-3" icon={MagicIcon} />
            <ToggleButton class="ml-3" icon={FilterIcon}>
                Filtros Avançados
            </ToggleButton>
            <GamesList list={games()} />
        </div>
    )
}


interface GameListPros {
    list: Array<GameProps>
}

function GamesList(props: GameListPros) {
    return (
        <div class={style.gamelist} id="gamelist" tabindex="1">
            <For each={props.list}>
                {(game: GameProps) => {
                    return (
                        <div onclick={(e) => console.log(game.name)} class="flex w-full">
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