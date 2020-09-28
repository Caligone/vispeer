import { h } from 'preact';

import './Button.scss';

export const enum Color {
    PRIMARY = 'primary',
}
export const enum NodeType {
    A = 'a',
    BUTTON = 'button',
    INPUT = 'input',
}

type ButtonProps = {
    nodeType?: NodeType
    children?: h.JSX.Element | string | Array<h.JSX.Element | string>
    color: Color
    href?: string
    type?: string
    value?: string
}

export default function Button({ nodeType, color, children, ...props }: ButtonProps): h.JSX.Element {
    const classNames = [
        'c-button',
        `c-button__color-${color}`
    ];
    return h((nodeType ?? 'button') as string, {
        className: classNames.join(' '),
        ...props
    }, children);
}