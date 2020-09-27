import { h } from 'preact';
import { Router, Route } from 'preact-router';

import * as Messaging from './ContextModules/MessagingModule';
import * as Connections from './ContextModules/ConnectionsModule';

import HomePage from './Pages/HomePage';
import JoinPage from './Pages/JoinPage';

function Providers({ children }: { children: Array<h.JSX.Element> | h.JSX.Element }): h.JSX.Element {
    return (
        <Messaging.Provider>
            <Connections.Provider>
                {children}
            </Connections.Provider>
        </Messaging.Provider>
    );
}

export default function App(): h.JSX.Element {
    return (
        <Providers>
            <Router>
                <Route path="/" component={HomePage} />
                <Route path="/join/:roomName" component={JoinPage} />
                {/* <Search path="/search/:query/:advanced?" /> */}
                <Route default component={() => (<h1>Not found</h1>)} />
            </Router>
        </Providers>
    );
}
