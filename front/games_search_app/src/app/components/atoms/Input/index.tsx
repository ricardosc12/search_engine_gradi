import { splitProps } from "solid-js";
import { JSX } from 'solid-js/jsx-runtime'
import style from './style.module.css'

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    icon?: any;
}

export function Input(props: InputProps) {
    const [local, others] = splitProps(props, ["icon"]);
    return (
        <div class={style.root_input}>
            {local.icon ? local.icon() : ''}
            <input {...others} />
        </div>
    )
}