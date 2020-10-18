import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef, useState } from 'preact/hooks';
import {
    default as SignalingServerConnection,
    Events as SignalingEvents,
} from '../lib/SignalingServerConnection';
import useIdentities from '../Hooks/IdentitiesContext';

import CONFIGURATION from '../config';
import { CONNECTION_STATUS } from '../lib/Connections';

type ContextType = {
    connectionStatus: CONNECTION_STATUS,
    roomName: string,
    setRoomName: (_: string) => void,
    connect: (serverURL: string, name: string, roomName: string) => Promise<void>,
};

const Context = createContext<ContextType>({} as ContextType);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const { current: signalingServerConnection } = useRef(new SignalingServerConnection());
    const { currentIdentity } = useIdentities();
    const serverUrl = CONFIGURATION.signalingServerUrl;
    const [roomName, setRoomName] = useState<string>(Math.random().toString(36).substring(7));
    const [connectionStatus, setConnectionStatus] = useState<CONNECTION_STATUS>(CONNECTION_STATUS.IDLE);

    const context: ContextType = {
        connectionStatus,
        connect: signalingServerConnection.connect.bind(signalingServerConnection),
        roomName,
        setRoomName,
    };

    useEffect(() => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    }, [currentIdentity]);

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);