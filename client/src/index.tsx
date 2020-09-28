import 'regenerator-runtime/runtime';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';

import 'preact/debug';

import App from './App';

const container = document.querySelector('body');
if (container) {
    render(<App />, container);
}