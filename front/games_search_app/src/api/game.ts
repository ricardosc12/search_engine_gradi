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