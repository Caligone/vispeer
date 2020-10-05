import { h } from 'preact';

import './TopBar.scss';

type Props = {
    children?: h.JSX.Element | string | Array<h.JSX.Element | string>
}

export default function TopBar({ children }: Props): h.JSX.Element {
    return (
        <div className="c-topbar">
            {children}
        </div>
    );
}