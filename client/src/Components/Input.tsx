import { h } from 'preact';

import './Input.scss';

type InputProps = {
    type: string,
    value: string,
    id: string,
    name: string,
    placeholder?: string,
    onChange?: h.JSX.GenericEventHandler<HTMLInputElement>,
}

export default function Input({ onChange, ...props }: InputProps): h.JSX.Element {
    const classNames = [
        'c-input',
    ];
    return (
        <input
            className={classNames.join(' ')}
            onChange={onChange}
            {...props}
        />
    )
}
