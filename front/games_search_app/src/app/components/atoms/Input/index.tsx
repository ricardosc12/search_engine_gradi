import { JSX } from "solid-js/jsx-runtime";
import style from './style.module.css'

export function Input(props: JSX.HTMLElementTags['input']) {
    return (
        <input class={style.input} {...props} />
    )
}