import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Message, MESSAGE_TYPES } from '../@types/Messaging';
import MessageInput from '../Components/MessageInput';

import useMessaging from '../Hooks/MessagingContext';
import useConnections from '../Hooks/ConnectionsContext';
import { CONNECTION_STATUS } from '../@types/Connections';

type MessageInputContainerProps = {
    onMessageSend: (message: Message) => void,
};

export default function MessageInputContainer({ onMessageSend }: MessageInputContainerProps): h.JSX.Element {
    const [currentMessage, setCurrentMessage] = useState('');
    const { nickname, addMessage } = useMessaging();
    const { peerConnectionStatus } = useConnections();
    return (
        <MessageInput
            currentMessage={currentMessage}
            isDisabled={peerConnectionStatus !== CONNECTION_STATUS.CONNECTED}
            onSubmit={() => {
                if (currentMessage.length === 0) return;
                const message = {
                    type: MESSAGE_TYPES.LOCAL,
                    author: nickname,
                    content: currentMessage,
                    date: Date.now(),
                };
                addMessage(message);
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