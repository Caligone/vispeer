import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef, useState } from 'preact/hooks';
import useConnections from './ConnectionsContext';
import useIdentities from './IdentitiesContext';
import useSignalingServerConnection from './SignalingServerConnectionContext';
import useMessaging, { Message, MESSAGE_TYPES } from './MessagingContext';
import {
    default as PeerConnection,
    Events as PeerEvents,
} from '../lib/PeerConnection';
import Identity from '../lib/Identity';

type ContextType = {
    connect: (_: string) => void,
    sendTextMessage: (_: Message, to: Identity) => void,
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
    const { signalingServerConnection } = useSignalingServerConnection();
    const { current: peerConnection } = useRef(new PeerConnection(signalingServerConnection));
    const [ remoteStream, setRemoteStream ] = useState<MediaStream | null>(null);
    const [ localStream, setLocalStream ] = useState<MediaStream | null>(null);
    const {
        setServerConnectionStatus,
        setPeerConnectionStatus,
    } = useConnections();
    const { 
        addMessage,
        roomName,
    } = useMessaging();
    const {
        currentIdentity,
        addPeerIdentity,
    } = useIdentities();

    const context: ContextType = {
        connect: peerConnection.connect.bind(peerConnection),
        sendTextMessage: peerConnection.sendTextMessage.bind(peerConnection),
        removeAudioStream: peerConnection.removeAudioStream.bind(peerConnection),
        addAudioStream: peerConnection.addAudioStream.bind(peerConnection),
        removeVideoStream: peerConnection.removeVideoStream.bind(peerConnection),
        addVideoStream: peerConnection.addVideoStream.bind(peerConnection),
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
        peerConnection.setRoomName(roomName);
        const unsubscribeToSignalingConnectionStatusChangedEvent = peerConnection.signalingConnectionStatusChangedEvent
            .subscribe((event: PeerEvents.SignalingConnectionStatusChanged) => {
                setServerConnectionStatus(event.status);
                addInternalMessage(`Server connection status changed to ${event.status}`);
            });
        const unsubscribeToConnectionStatusChangedEvent = peerConnection.connectionStatusChangedEvent
            .subscribe((event: PeerEvents.ConnectionStatusChanged) => {
                setPeerConnectionStatus(event.status);
                addInternalMessage(`Peer connection status changed to ${event.status}`);
            });
        const unsubscribeToPeerIdentityReceived = peerConnection.peerIdentityReceived
            .subscribe((event: PeerEvents.IdentityReceived) => {
                addPeerIdentity(event.identity);
            });
        const unsubscribeToTextMessageReceivedEvent = peerConnection.textMessageReceivedEvent
            .subscribe((event: PeerEvents.TextMessageReceived) => {
                addMessage({
                    ...event.message,
                    type: MESSAGE_TYPES.REMOTE,
                });
            });
        const unsubscribeToLocalAudioStreamAddedEvent = peerConnection.localAudioStreamAddedEvent
            .subscribe((event: PeerEvents.LocalAudioStreamAdded) => {
                setLocalStream(event.stream);
                addInternalMessage('You started streaming audio');
            });
        const unsubscribeToLocalAudioStreamRemovedEvent = peerConnection.localAudioStreamRemovedEvent
            .subscribe((event: PeerEvents.LocalAudioStreamRemoved) => {
                setLocalStream(event.stream);
                addInternalMessage('You stopped streaming audio');
            });
        const unsubscribeToLocalVideoStreamAddedEvent = peerConnection.localVideoStreamAddedEvent
            .subscribe((event: PeerEvents.LocalVideoStreamAdded) => {
                setLocalStream(event.stream);
                addInternalMessage('You started streaming video');
            });
        const unsubscribeToLocalVideoStreamRemovedEvent = peerConnection.localVideoStreamRemovedEvent
            .subscribe((event: PeerEvents.LocalVideoStreamRemoved) => {
                setLocalStream(event.stream);
                addInternalMessage('You stopped streaming video');
            });
        const unsubscribeToRemoteAudioStreamAddedEvent = peerConnection.remoteAudioStreamAddedEvent
            .subscribe((event: PeerEvents.RemoteAudioStreamAdded) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer started streaming audio');
            });
        const unsubscribeToRemoteAudioStreamRemovedEvent = peerConnection.remoteAudioStreamRemovedEvent
            .subscribe((event: PeerEvents.RemoteAudioStreamRemoved) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer stopped streaming audio');
            });
        const unsubscribeToRemoteVideoStreamAddedEvent = peerConnection.remoteVideoStreamAddedEvent
            .subscribe((event: PeerEvents.RemoteVideoStreamAdded) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer started streaming video');
            });
        const unsubscribeToRemoteVideoStreamRemovedEvent = peerConnection.remoteVideoStreamRemovedEvent
            .subscribe((event: PeerEvents.RemoteVideoStreamRemoved) => {
                setRemoteStream(event.stream);
                addInternalMessage('Your peer stopped streaming video');
            });

        return () => {
            unsubscribeToSignalingConnectionStatusChangedEvent();
            unsubscribeToConnectionStatusChangedEvent();
            unsubscribeToPeerIdentityReceived();
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
        peerConnection.setRoomName(roomName);
    }, [roomName]);

    useEffect(() => {
        if (!currentIdentity) return;
        peerConnection.setOwnIdentity(currentIdentity);
    }, [currentIdentity]);

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);