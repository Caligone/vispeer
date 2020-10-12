import { h, createContext } from 'preact';
import { useContext as preactUseContext } from 'preact/hooks';
import { useState } from 'preact/hooks';
import { CONNECTION_STATUS } from '../lib/Connections';

type ContextType = {
    serverConnectionStatus: CONNECTION_STATUS,
    setServerConnectionStatus: (_: CONNECTION_STATUS) => void,
    peerConnectionStatus: CONNECTION_STATUS,
    setPeerConnectionStatus: (_: CONNECTION_STATUS) => void,
    serverUrl: string,
    setServerUrl: (_: string) => void,
};

const defaultState: ContextType = {
    serverConnectionStatus: CONNECTION_STATUS.IDLE,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setServerConnectionStatus: () => {},
    peerConnectionStatus: CONNECTION_STATUS.IDLE,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setPeerConnectionStatus: () => {},
    serverUrl: 'wss://server.talk.calig.one',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setServerUrl: () => {},
} 

const Context = createContext<ContextType>(defaultState);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const [serverConnectionStatus, setServerConnectionStatus] = useState(defaultState.serverConnectionStatus);
    const [peerConnectionStatus, setPeerConnectionStatus] = useState(defaultState.peerConnectionStatus);
    const [serverUrl, setServerUrl] = useState(defaultState.serverUrl);

    const context: ContextType = {
        serverConnectionStatus,
        setServerConnectionStatus,
        peerConnectionStatus,
        setPeerConnectionStatus,
        serverUrl,
        setServerUrl,
    };

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);