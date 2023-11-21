import { For, createSignal } from 'solid-js'
import style from './style.module.css'
import { BookIcon, GamesIcon } from '@/icons';

interface RouteProps {
    id: string;
    title: string;
    icon: any;
}

export const routes = [
    { id: 'loja', title: "Loja", icon: GamesIcon },
    { id: 'biblioteca', title: "Biblioteca", icon: BookIcon },
]

export function Sidebar() {

    const [route, setRoute] = createSignal('loja')

    function handleConfig() {
        //modal de configurações
    }

    return (
        <div class={style.root}>
            <img width="100px" src="steam-logo.png" alt="STEAM" />
            <nav>
                <ul>
                    <For each={routes}>
                        {(item: RouteProps) => (
                            <li
                                aria-checked={route() == item.id}
                                onclick={_ => setRoute(item.id)}>
                                {item.icon()}
                                <p>{item.title}</p>
                            </li>
                        )}
                    </For>
                </ul>
                <ul>
                    <li onclick={handleConfig}>Configuração</li>
                </ul>
            </nav>
        </div >
    )
}