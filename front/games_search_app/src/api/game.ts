import { GameProps } from "@/app/components/interfaces/game";
import { api } from "./axios";

export interface SearchGameProps {
    name?: string;
    ano?: string;
    languages?: string;
    categories?: string;
    genres?: string;
    developers?: string;
    publishers?: string;
    size?: string;
}

export function searchGame(props: SearchGameProps) {
    return api.get('/game', {
        params: props
    })
}

export function publiGame(props: GameProps) {
    return api.post('/pub', props)
}

export function getLibGames() {
    return api.get("/lib")
}

export function deleteGame(props: { id: string }) {
    return api.post('/remove', props)
}