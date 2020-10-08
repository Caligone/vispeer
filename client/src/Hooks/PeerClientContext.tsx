import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef, useState } from 'preact/hooks';
import { EventData } from '../lib/EventEmitter';
import useConnections from './ConnectionsContext';
import useMessaging from './MessagingContext';
import {
    default as PeerClient,
    EVENTS as PEER_CONNECTION_EVENTS,
} from '../lib/PeerClient';
import { CONNECTION_STATUS } from '../@types/Connections';
import { MESSAGE_TYPES, Message } from '../@types/Messaging';
import * as Messages from '../Messages';

type ContextType = {
    connect: (_: string) => void,
    sendTextMessage: (_: Message) => void,
    removeAudioStream: () => void,
    addAudioStream: () => void,
    removeVideoStream: () => void,
    addVideoStream: () => void,
    remoteStream: MediaStream | null,
    localStream: MediaStream | null,
};

const defaultState: ContextType = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    connect: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sendTextMessage: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    removeAudioStream: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    addAudioStream: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    removeVideoStream: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    addVideoStream: () => {},
    remoteStream: null,
    localStream: null,
} 

type ConnectionStatusChangedEventData = {
    status: CONNECTION_STATUS,
};

const Context = createContext<ContextType>(defaultState);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const { current: peerClient } = useRef(new PeerClient());
    const [ remoteStream, setRemoteStream ] = useState<MediaStream | null>(null);
    const [ localStream, setLocalStream ] = useState<MediaStream | null>(null);
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
        connect: peerClient.connect.bind(peerClient),
        sendTextMessage: peerClient.sendTextMessage.bind(peerClient),
        removeAudioStream: peerClient.removeAudioStream.bind(peerClient),
        addAudioStream: peerClient.addAudioStream.bind(peerClient),
        removeVideoStream: peerClient.removeVideoStream.bind(peerClient),
        addVideoStream: peerClient.addVideoStream.bind(peerClient),
        remoteStream,
        localStream,
    };

    function onServerConnectionStatusChanged(rawEventData: EventData) {
        const eventData = rawEventData as unknown as ConnectionStatusChangedEventData;
        setServerConnectionStatus(eventData.status);
        addMessage({
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content: `Server connection status changed to ${eventData.status}`,
            date: Date.now(),
            attachements: [],
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
            attachements: [],
        });
    }

    function onTextMessage(rawEventData: EventData) {
        addMessage({
            ...(rawEventData as Messages.TextMessageEventData).message,
            type: MESSAGE_TYPES.REMOTE,
        });
    }

    function onRemoteStreamChanged(data: EventData) {
        const { stream } = data as Messages.RemoteStreamChangedEventData;
        setRemoteStream(stream);
        let content = null;
        switch(data.eventName) {
            case Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_ADDED:
                content = 'Your peer started streaming audio';
                break;
            case Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED:
                content = 'Your peer stopped streaming audio';
                break;
            case Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_ADDED:
                content = 'Your peer started streaming video';
                break;
            case Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED:
                content = 'Your peer stopped streaming video';
                break;
            default:
                throw new Error(`Invalid remoteStreamChanged event: ${JSON.stringify(data)}`);
        }
        addMessage({
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content,
            date: Date.now(),
            attachements: [],
        });
    }

    function onLocalStreamChanged(data: EventData) {
        const { stream } = data as Messages.LocalStreamChangedEventData;
        setLocalStream(stream);
        let content = null;
        switch(data.eventName) {
            case Messages.PEER_MESSAGE_TYPE.LOCAL_AUDIO_ADDED:
                content = 'You started streaming audio';
                break;
            case Messages.PEER_MESSAGE_TYPE.LOCAL_AUDIO_REMOVED:
                content = 'You stopped streaming audio';
                break;
            case Messages.PEER_MESSAGE_TYPE.LOCAL_VIDEO_ADDED:
                content = 'You started streaming video';
                break;
            case Messages.PEER_MESSAGE_TYPE.LOCAL_VIDEO_REMOVED:
                content = 'You stopped streaming video';
                break;
            default:
                throw new Error(`Invalid localStreamChanged event: ${JSON.stringify(data)}`);
        }
        addMessage({
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content,
            date: Date.now(),
            attachements: [],
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
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.REMOTE_AUDIO_ADDED, onRemoteStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.REMOTE_AUDIO_REMOVED, onRemoteStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.REMOTE_VIDEO_ADDED, onRemoteStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.REMOTE_VIDEO_REMOVED, onRemoteStreamChanged);

        peerClient.addEventListener(PEER_CONNECTION_EVENTS.LOCAL_AUDIO_ADDED, onLocalStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.LOCAL_AUDIO_REMOVED, onLocalStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.LOCAL_VIDEO_ADDED, onLocalStreamChanged);
        peerClient.addEventListener(PEER_CONNECTION_EVENTS.LOCAL_VIDEO_REMOVED, onLocalStreamChanged);
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
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.REMOTE_AUDIO_ADDED, onRemoteStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.REMOTE_AUDIO_REMOVED, onRemoteStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.REMOTE_VIDEO_ADDED, onRemoteStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.REMOTE_VIDEO_REMOVED, onRemoteStreamChanged);
    
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.LOCAL_AUDIO_ADDED, onLocalStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.LOCAL_AUDIO_REMOVED, onLocalStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.LOCAL_VIDEO_ADDED, onLocalStreamChanged);
            peerClient.removeEventListener(PEER_CONNECTION_EVENTS.LOCAL_VIDEO_REMOVED, onLocalStreamChanged);
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