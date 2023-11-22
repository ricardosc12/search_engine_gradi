import { RootToggleButton } from './style';

interface ToggleProps {
    icon?: any;
    color?: 'azulzinho' | 'azul';
    value?: boolean;
    class?: string;
    children?: string;
}

export function ToggleButton(props: ToggleProps) {
    return (
        <div class={RootToggleButton({
            color: props.color,
            class: props.class,
            active: false
        })}>
            {props.children ? <p>{props.children}</p> : ''}
            {props.icon ? props.icon() : ''}
        </div>
    )
}