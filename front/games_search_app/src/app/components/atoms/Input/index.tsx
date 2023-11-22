import { JSX } from 'solid-js/jsx-runtime'
import style from './style.module.css'

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    icon?: any;
}

export function Input(props: InputProps) {
    return (
        <div class={style.root_input}>
            {props.icon ? props.icon() : ''}
            <input {...props} />
        </div>
    )
}