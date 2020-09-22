import { h } from 'preact';

export type Action = {
    type: string,
};

export type Dispatch = (action: Action) => void;

export type ProviderProps = {
    children: h.JSX.Element | Array<h.JSX.Element | null>
};