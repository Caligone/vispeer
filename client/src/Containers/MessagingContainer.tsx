import { h } from 'preact';

import * as Connections from '../Hooks/ConnectionsModule';
import * as Messaging from '../Hooks/MessagingModule';

import MessagesContainer from '../Components/MessagesContainer';
import MessageInputContainer from './MessageInputContainer';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message } from '../@types/Messaging';

type MessagingContainerType = {
    onMessageSend: (message: Message) => void,
};

export default function MessagingContainer({ onMessageSend }: MessagingContainerType): h.JSX.Element | null {
    const { wsStatus } = Connections.useState();
    const { messages } = Messaging.useState();
    if (wsStatus === CONNECTION_STATUS.IDLE) return null;
    return (
        <div>
            <MessagesContainer messages={messages} />
            <MessageInputContainer onMessageSend={onMessageSend} />
        </div>
    );
}