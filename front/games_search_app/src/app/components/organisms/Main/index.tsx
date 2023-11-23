import { FeatureGames } from "./components/FeatureGames";
import { GamesList } from "./components/GamesList";
import { HeaderMain } from "./components/Header";
import { GameStorageProvider } from "./storage";
import style from './style.module.css'

export function MainGames() {
    return (
        <GameStorageProvider>
            <div class={style.root}>
                <HeaderMain />
                <FeatureGames />
                <GamesList />
            </div>
        </GameStorageProvider>
    )
}