import { h } from 'preact';

import * as Connections from '../ContextModules/ConnectionsModule';

import MessagesContainer from './MessagesContainer';
import MessageInputContainer from './MessageInputContainer';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message } from '../@types/Messaging';

type MessagingContainerType = {
    onMessageSend: (message: Message) => void,
};

export default function MessagingContainer({ onMessageSend }: MessagingContainerType): h.JSX.Element | null {
    const { wsStatus } = Connections.useState();
    if (wsStatus === CONNECTION_STATUS.IDLE) return null;
    return (
        <div>
            <MessagesContainer />
            <MessageInputContainer onMessageSend={onMessageSend} />
        </div>
    );
}