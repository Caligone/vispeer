import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import {
    default as WRTCClient,
    EVENTS as WRTC_CONNECTION_EVENTS,
    WRTCConnectionStatusChangedEventData,
} from '../lib/WRTCClient';

import * as ConnectionStatus from '../ContextModules/ConnectionsModule';
import * as Messaging from '../ContextModules/MessagingModule';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message, MESSAGE_TYPES } from '../@types/Messaging';
import ConnectionFormContainer from './ConnectionFormContainer';
import MessagingContainer from './MessagingContainer';
import { EventData } from '../lib/EventEmitter';
import { TextMessageEventData } from '../Messages';

import ConnectionStatusComponent from '../Components/ConnectionStatus';

type WSConnectionStatusChangedEventData = {
    status: CONNECTION_STATUS,
};

export default function WRTCClientContainer(): h.JSX.Element {
    const connectionStatusDispatch = ConnectionStatus.useDispatch()
    const {
        wsStatus,
        wrtcStatus,
        serverUrl,
    } = ConnectionStatus.useState();
    const { nickname } = Messaging.useState();
    const messagingDispatch = Messaging.useDispatch();
    const wrtcClientRef = useRef(new WRTCClient());
    useEffect(() => {
        // WS Connection status
        wrtcClientRef.current.addEventListener(
            WRTC_CONNECTION_EVENTS.WS_CONNECTION_STATUS_CHANGED,
            (rawEventData: EventData) => {
                const eventData = rawEventData as unknown as WSConnectionStatusChangedEventData;
                const statusAction = ConnectionStatus.setWSStatus(eventData.status);
                connectionStatusDispatch(statusAction);
                const message: Message = {
                    type: MESSAGE_TYPES.INTERNAL,
                    author: 'Internal',
                    content: `WS Connection status changed to ${eventData.status}`,
                    date: Date.now(),
                };
                const messageAction = Messaging.addMessage(message);
                messagingDispatch(messageAction);
            },
        );
        // WRTC Connection status
        wrtcClientRef.current.addEventListener(
            WRTC_CONNECTION_EVENTS.CONNECTION_STATUS_CHANGED,
            (rawEventData: EventData) => {
                const eventData = rawEventData as unknown as WRTCConnectionStatusChangedEventData;
                const statusAction = ConnectionStatus.setWRTCStatus(eventData.status);
                connectionStatusDispatch(statusAction);
                const message: Message = {
                    type: MESSAGE_TYPES.INTERNAL,
                    author: 'Internal',
                    content: `WRTC Connection status changed to ${eventData.status}`,
                    date: Date.now(),
                };
                const messageAction = Messaging.addMessage(message);
                messagingDispatch(messageAction);
            },
        );
        // WRTC New text message
        wrtcClientRef.current.addEventListener(
            WRTC_CONNECTION_EVENTS.TEXT_MESSAGE,
            (rawEventData: EventData) => {
                const eventData = {
                    ...rawEventData as TextMessageEventData,
                    type: MESSAGE_TYPES.REMOTE,
                };
                const action = Messaging.addMessage(eventData);
                messagingDispatch(action);
            },
        );
        return () => {
            // TODO Clean up
        };
    }, []);
    
    return (
        <div>
            <div>
                <ConnectionStatusComponent name="Server" status={wsStatus} />
                <ConnectionStatusComponent name="Peer" status={wrtcStatus} />
            </div>
            <ConnectionFormContainer onSubmit={(e) => {
                e.preventDefault();
                wrtcClientRef.current.setNickname(nickname);
                wrtcClientRef.current.connect(serverUrl);
            }} />
            <MessagingContainer onMessageSend={(message: Message) => {
                wrtcClientRef.current.sendTextMessage(message.content);
            }}/>
        </div>
    );
}