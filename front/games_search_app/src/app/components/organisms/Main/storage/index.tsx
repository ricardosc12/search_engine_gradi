import { SearchGameProps } from "@/api/game";
import { createContext, useContext } from "solid-js";
import { produce } from "solid-js/store"
import { createStore } from "solid-js/store";

const GamesContext = createContext<GameContextValue>();

interface GameContextValue {
    dados: {
        filters: SearchGameProps,
        name: any
    };
    dispatch: {
        setFilters: (props: SearchGameProps) => void,
        setNameFilter: (props: string) => void
    };
}
//@ts-ignore
export const useGameStore = (): GameContextValue => useContext<GameContextValue>(GamesContext);

export function GameStorageProvider(props: any) {

    const [state, set] = createStore({
        dados: {
            filters: {},
            name: ""
        }
    });

    const counter = {
        dados: state.dados,
        dispatch: {
            setFilters: (payload: SearchGameProps) => set(produce((state) => {
                state.dados.filters = { ...payload }
            })),
            setNameFilter: (name: any) => set(produce((state) => {
                state.dados.name = name?.target?.value || undefined
            })),
        }
    }


    return (
        <GamesContext.Provider value={counter}>
            {props.children}
        </GamesContext.Provider>
    );
}