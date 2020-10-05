import { h } from 'preact';

import './Button.scss';
import { Color, Size } from './Variables';

export const enum NodeType {
    A = 'a',
    BUTTON = 'button',
    INPUT = 'input',
}

type ButtonProps = {
    nodeType?: NodeType
    children?: h.JSX.Element | string | Array<h.JSX.Element | string>
    color: Color
    size?: Size
    active?: boolean
    href?: string
    onClick?: () => void
    type?: string
    value?: string
}

export default function Button({ nodeType, color, size, active, children, ...props }: ButtonProps): h.JSX.Element {
    const classNames = [
        'c-button',
        `c-button__color-${color ?? Color.PRIMARY}`,
        `c-button__size-${size ?? Size.MEDIUM}`,
        active ? 'c-button__active' : '',
    ];
    return h((nodeType ?? 'button') as string, {
        className: classNames.join(' '),
        ...props
    }, children);
}