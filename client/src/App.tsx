import { h } from 'preact';

import * as Messaging from './ContextModules/MessagingModule';
import * as Connections from './ContextModules/ConnectionsModule';

import WRTCClientContainer from './Containers/WRTCClientContainer';

export default function App(): h.JSX.Element {
    return (
        <Messaging.Provider>
            <Connections.Provider>
                <WRTCClientContainer />
            </Connections.Provider>
        </Messaging.Provider>
    );
}
