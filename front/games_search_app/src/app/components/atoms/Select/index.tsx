//@ts-ignore
import { Select as SelectSolid, CreateSelectProps } from "@thisbeyond/solid-select";
import { splitProps } from "solid-js";
import './style.css'
import './custom.css'

interface SelectProps extends CreateSelectProps {
    icon?: any;
}

export function Select(props: SelectProps) {
    const [local, others] = splitProps(props, ["icon"]);
    return (
        <div class="flex items-center w-full custom">
            {local.icon ? local.icon() : ''}
            <SelectSolid class="w-full" {...others} />
        </div>
    )
}