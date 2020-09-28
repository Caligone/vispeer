import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';

import { EVENTS as WRTC_CONNECTION_EVENTS } from '../lib/WRTCClient';

import * as ConnectionStatus from '../Hooks/ConnectionsModule';
import * as Messaging from '../Hooks/MessagingModule';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message, MESSAGE_TYPES } from '../@types/Messaging';
import ConnectionFormContainer from './ConnectionFormContainer';
import MessagingContainer from './MessagingContainer';
import { EventData } from '../lib/EventEmitter';
import { TextMessageEventData } from '../Messages';
import useWebRTCClient from '../Hooks/WRTCClientHook';

type WSConnectionStatusChangedEventData = {
    status: CONNECTION_STATUS,
};

type WRTCClientContainerProps = {
    roomName: string
}

const enum ConnectionTypes {
    WRTC = 'Peer',
    WS = 'Signaling server',
}

export default function WRTCClientContainer({ roomName }: WRTCClientContainerProps): h.JSX.Element {
    const connectionStatusDispatch = ConnectionStatus.useDispatch();
    const { serverUrl } = ConnectionStatus.useState();
    const { nickname } = Messaging.useState();
    const messagingDispatch = Messaging.useDispatch();
    const wrtcClientRef = useWebRTCClient();

    function dispatchMessageConnectionStatusChanged(connectionType: ConnectionTypes, status: CONNECTION_STATUS) {
        const message: Message = {
            type: MESSAGE_TYPES.INTERNAL,
            author: 'Internal',
            content: `${connectionType} connection status changed to ${status}`,
            date: Date.now(),
        };
        const messageAction = Messaging.addMessage(message);
        messagingDispatch(messageAction);
    }

    function onWSConnectionStatusChanged(rawEventData: EventData) {
        const eventData = rawEventData as unknown as WSConnectionStatusChangedEventData;
        const statusAction = ConnectionStatus.setWSStatus(eventData.status);
        connectionStatusDispatch(statusAction);
        dispatchMessageConnectionStatusChanged(ConnectionTypes.WS, eventData.status);
    }

    function onWRTCConnectionStatusChanged(rawEventData: EventData) {
        const eventData = rawEventData as unknown as WSConnectionStatusChangedEventData;
        const statusAction = ConnectionStatus.setWRTCStatus(eventData.status);
        connectionStatusDispatch(statusAction);
        dispatchMessageConnectionStatusChanged(ConnectionTypes.WRTC, eventData.status);
    }

    function onTextMessage(rawEventData: EventData) {
        const eventData = {
            ...rawEventData as TextMessageEventData,
            type: MESSAGE_TYPES.REMOTE,
        };
        const action = Messaging.addMessage(eventData);
        messagingDispatch(action);
    }

    useEffect(() => {
        // WS Connection status
        wrtcClientRef.addEventListener(
            WRTC_CONNECTION_EVENTS.WS_CONNECTION_STATUS_CHANGED,
            onWSConnectionStatusChanged,
        );
        // WRTC Connection status
        wrtcClientRef.addEventListener(
            WRTC_CONNECTION_EVENTS.CONNECTION_STATUS_CHANGED,
            onWRTCConnectionStatusChanged,
        );
        // WRTC New text message
        wrtcClientRef.addEventListener(
            WRTC_CONNECTION_EVENTS.TEXT_MESSAGE,
            onTextMessage,
        );
        return () => {
            wrtcClientRef.removeEventListener(
                WRTC_CONNECTION_EVENTS.WS_CONNECTION_STATUS_CHANGED,
                onWSConnectionStatusChanged,
            );
            wrtcClientRef.removeEventListener(
                WRTC_CONNECTION_EVENTS.CONNECTION_STATUS_CHANGED,
                onWRTCConnectionStatusChanged,
            );
            wrtcClientRef.removeEventListener(
                WRTC_CONNECTION_EVENTS.TEXT_MESSAGE,
                onTextMessage,
            );
        };
    }, []);

    // Set RoomName from URL
    useEffect(() => {
        const setRoomNameAction = Messaging.setRoomName(roomName);
        messagingDispatch(setRoomNameAction);
        wrtcClientRef.setRoomName(roomName);
    }, [roomName]);
    
    return (
        <Fragment>
            <ConnectionFormContainer onSubmit={(e) => {
                e.preventDefault();
                wrtcClientRef.setNickname(nickname);
                wrtcClientRef.connect(serverUrl);
            }} />
            <MessagingContainer onMessageSend={(message: Message) => {
                wrtcClientRef.sendTextMessage(message.content);
            }}/>
        </Fragment>
    );
}