import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef, useState } from 'preact/hooks';
import useConnections from './ConnectionsContext';
import useMessaging, { Message, MESSAGE_TYPES } from './MessagingContext';
import {
    default as PeerClient,
    Events as PeerEvents,
} from '../lib/PeerClient';

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

    function addInternalMessage(content: string) {
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
        const unsubscribeToSignalingConnectionStatusChangedEvent = peerClient.signalingConnectionStatusChangedEvent
            .subscribe((event: PeerEvents.SignalingConnectionStatusChanged) => {
                setServerConnectionStatus(event.status);
                addInternalMessage(`Server connection status changed to ${event.status}`);
            });
        const unsubscribeToConnectionStatusChangedEvent = peerClient.connectionStatusChangedEvent
            .subscribe((event: PeerEvents.ConnectionStatusChanged) => {
                setPeerConnectionStatus(event.status);
                addInternalMessage(`Peer connection status changed to ${event.status}`);
            });
        const unsubscribeToTextMessageReceivedEvent = peerClient.textMessageReceivedEvent
            .subscribe((event: PeerEvents.TextMessageReceived) => {
                addMessage({
                    ...event.message,
                    type: MESSAGE_TYPES.REMOTE,
                });
            });
        const unsubscribeToLocalAudioStreamAddedEvent = peerClient.localAudioStreamAddedEvent
            .subscribe((event: PeerEvents.LocalAudioStreamAdded) => {
                setLocalStream(event.stream);
                addInternalMessage('You started streaming audio');
            });
        const unsubscribeToLocalAudioStreamRemovedEvent = peerClient.localAudioStreamRemovedEvent
            .subscribe((event: PeerEvents.LocalAudioStreamRemoved) => {
                setLocalStream(event.stream);
                addInternalMessage('You stopped streaming audio');
            });
        const unsubscribeToLocalVideoStreamAddedEvent = peerClient.localVideoStreamAddedEvent
            .subscribe((event: PeerEvents.LocalVideoStreamAdded) => {
                setLocalStream(event.stream);
                addInternalMessage('You started streaming video');
            });
        const unsubscribeToLocalVideoStreamRemovedEvent = peerClient.localVideoStreamRemovedEvent
            .subscribe((event: PeerEvents.LocalVideoStreamRemoved) => {
                setLocalStream(event.stream);
                addInternalMessage('You stopped streaming video');
            });
        const unsubscribeToRemoteAudioStreamAddedEvent = peerClient.remoteAudioStreamAddedEvent
            .subscribe((event: PeerEvents.RemoteAudioStreamAdded) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer started streaming audio');
            });
        const unsubscribeToRemoteAudioStreamRemovedEvent = peerClient.remoteAudioStreamRemovedEvent
            .subscribe((event: PeerEvents.RemoteAudioStreamRemoved) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer stopped streaming audio');
            });
        const unsubscribeToRemoteVideoStreamAddedEvent = peerClient.remoteVideoStreamAddedEvent
            .subscribe((event: PeerEvents.RemoteVideoStreamAdded) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer started streaming video');
            });
        const unsubscribeToRemoteVideoStreamRemovedEvent = peerClient.remoteVideoStreamRemovedEvent
            .subscribe((event: PeerEvents.RemoteVideoStreamRemoved) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer stopped streaming video');
            });

        return () => {
            unsubscribeToSignalingConnectionStatusChangedEvent();
            unsubscribeToConnectionStatusChangedEvent();
            unsubscribeToTextMessageReceivedEvent();
            unsubscribeToLocalAudioStreamAddedEvent();
            unsubscribeToLocalAudioStreamRemovedEvent();
            unsubscribeToLocalVideoStreamAddedEvent();
            unsubscribeToLocalVideoStreamRemovedEvent();
            unsubscribeToRemoteAudioStreamAddedEvent();
            unsubscribeToRemoteAudioStreamRemovedEvent();
            unsubscribeToRemoteVideoStreamAddedEvent();
            unsubscribeToRemoteVideoStreamRemovedEvent();
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