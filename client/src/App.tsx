import { h } from 'preact';
import { Router, Route } from 'preact-router';

import { Provider as MessagingProvider } from './Hooks/MessagingContext';
import { Provider as ConnectionsProvider } from './Hooks/ConnectionsContext';
import { Provider as PeerClientProvider } from './Hooks/PeerClientContext';

import HomePage from './Pages/HomePage';
import JoinPage from './Pages/JoinPage';

function Providers({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element {
    return (
        <MessagingProvider>
            <ConnectionsProvider>
                <PeerClientProvider>
                    {children}
                </PeerClientProvider>
            </ConnectionsProvider>
        </MessagingProvider>
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
