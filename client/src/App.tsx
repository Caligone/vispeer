import { h } from 'preact';
import { Router, Route } from 'preact-router';

import { Provider as IdentitiesContext } from './Hooks/IdentitiesContext';
import { Provider as MessagingProvider } from './Hooks/MessagingContext';
import { Provider as ConnectionsProvider } from './Hooks/ConnectionsContext';
import { Provider as PeerClientProvider } from './Hooks/PeerClientContext';

import HomePage from './Pages/HomePage';
import JoinPage from './Pages/JoinPage';
import IdentitiesPage from './Pages/IdentitiesPage';
import OnBoardingContainer from './Containers/OnBoardingContainer';

function Providers({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element {
    return (
        <IdentitiesContext>
            <MessagingProvider>
                <ConnectionsProvider>
                    <PeerClientProvider>
                        {children}
                    </PeerClientProvider>
                </ConnectionsProvider>
            </MessagingProvider>
        </IdentitiesContext>
    );
}

export default function App(): h.JSX.Element {
    return (
        <Providers>
            <OnBoardingContainer>
                <Router>
                    <Route path="/join/:roomName" component={JoinPage} />
                    <Route path="/identities" component={IdentitiesPage} />
                    <Route path="/" component={HomePage} />
                    <Route default component={() => (<h1>Not found</h1>)} />
                </Router>
            </OnBoardingContainer>
        </Providers>
    );
}
