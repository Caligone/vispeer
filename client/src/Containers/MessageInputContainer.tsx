import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Message, MESSAGE_TYPES } from '../@types/Messaging';
import MessageInput from '../Components/MessageInput';

import * as Messaging from '../Hooks/MessagingModule';
import * as Connections from '../Hooks/ConnectionsModule';
import { CONNECTION_STATUS } from '../@types/Connections';

type MessageInputContainerProps = {
    onMessageSend: (message: Message) => void,
};
export default function MessageInputContainer({ onMessageSend }: MessageInputContainerProps): h.JSX.Element {
    const [currentMessage, setCurrentMessage] = useState('');
    const { nickname } = Messaging.useState();
    const { wrtcStatus } = Connections.useState();
    const messagingDispatch = Messaging.useDispatch();
    return (
        <MessageInput
            currentMessage={currentMessage}
            isDisabled={wrtcStatus !== CONNECTION_STATUS.CONNECTED}
            onSubmit={(e) => {
                e.preventDefault();
                const message = {
                    type: MESSAGE_TYPES.LOCAL,
                    author: nickname,
                    content: currentMessage,
                    date: Date.now(),
                };
                messagingDispatch(Messaging.addMessage(message));
                onMessageSend(message);
                setCurrentMessage('');
            }}
            onInput={(e) => {
                e.preventDefault();
                setCurrentMessage(e.currentTarget.value);
            }}
        />
    );
}