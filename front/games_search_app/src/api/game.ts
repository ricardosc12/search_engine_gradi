import { api } from "./axios";

export function searchGamebyName(name: string) {
    return api.get('/game', {
        params: { name: name }
    })
}