import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef } from 'preact/hooks';
import { EventData } from '../lib/EventEmitter';
import useConnections from './ConnectionsContext';
import useMessaging from './MessagingContext';
import {
    default as PeerClient,
    EVENTS as PEER_CONNECTION_EVENTS,
} from '../lib/PeerClient';
import { CONNECTION_STATUS } from '../@types/Connections';
import { MESSAGE_TYPES } from '../@types/Messaging';
import { TextMessageEventData } from '../Messages';

type ContextType = {
    peerClient: PeerClient,
};

const defaultState: ContextType = {
    peerClient: new PeerClient(),
} 

type ConnectionStatusChangedEventData = {
    status: CONNECTION_STATUS,
};

const Context = createContext<ContextType>(defaultState);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const { current: peerClient } = useRef(new PeerClient());
    const {
        setServerConnectionStatus,
        setPeerConnectionStatus,
    } = useConnections();
    const { 
        addMessage,
        roomName,
        nickname, setNickname,
    } = useMessaging();

    const context: ContextType = {
        peerClient,
    };

    function onServerConnectionStatusChanged(rawEventData: EventData) {
        const eventData = rawEventData as unknown as ConnectionStatusChangedEventData;
        setServerConnectionStatus(eventData.status);
        addMessage({
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content: `Server connection status changed to ${eventData.status}`,
            date: Date.now(),
        });
    }
    function onPeerConnectionStatusChanged(rawEventData: EventData) {
        const eventData = rawEventData as unknown as ConnectionStatusChangedEventData;
        setPeerConnectionStatus(eventData.status);
        addMessage({
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content: `Peer connection status changed to ${eventData.status}`,
            date: Date.now(),
        });
    }

    function onTextMessage(rawEventData: EventData) {
        addMessage({
            ...rawEventData as TextMessageEventData,
            type: MESSAGE_TYPES.REMOTE,
        });
    }

    useEffect(() => {
        peerClient.setRoomName(roomName);
        peerClient.setNickname(nickname);
        peerClient.addEventListener(
            PEER_CONNECTION_EVENTS.SERVER_CONNECTION_STATUS_CHANGED,
            onServerConnectionStatusChanged,
        );
        peerClient.addEventListener(
            PEER_CONNECTION_EVENTS.CONNECTION_STATUS_CHANGED,
            onPeerConnectionStatusChanged,
        );
        peerClient.addEventListener(
            PEER_CONNECTION_EVENTS.TEXT_MESSAGE,
            onTextMessage,
        );
        return () => {
            peerClient.removeEventListener(
                PEER_CONNECTION_EVENTS.SERVER_CONNECTION_STATUS_CHANGED,
                onServerConnectionStatusChanged,
            );
            peerClient.removeEventListener(
                PEER_CONNECTION_EVENTS.CONNECTION_STATUS_CHANGED,
                onPeerConnectionStatusChanged,
            );
            peerClient.removeEventListener(
                PEER_CONNECTION_EVENTS.TEXT_MESSAGE,
                onTextMessage,
            );
        };
    }, []);

    useEffect(() => {
        peerClient.setRoomName(roomName);
    }, [roomName]);

    useEffect(() => {
        setNickname(nickname);
        peerClient.setNickname(nickname);
    }, [nickname]);

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);