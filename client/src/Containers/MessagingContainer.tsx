import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import useMessaging from '../Hooks/MessagingContext';
import usePeerClient from '../Hooks/PeerClientContext';

import MessagesContainer from '../Components/MessagesContainer';
import MessageInputContainer from './MessageInputContainer';
import MessagingOptions from './MessagingOptions';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message } from '../@types/Messaging';

export default function MessagingContainer(): h.JSX.Element | null {
    const { serverConnectionStatus } = useConnections();
    const { messages } = useMessaging();
    const { peerClient } = usePeerClient();
    if (serverConnectionStatus === CONNECTION_STATUS.IDLE) return null;
    return (
        <div>
            <MessagingOptions />
            <MessagesContainer messages={messages} />
            <MessageInputContainer onMessageSend={(message: Message) => {
                peerClient.sendTextMessage(message.content);
            }} />
        </div>
    );
}