import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Message } from '../@types/Messaging';

import * as Messaging from '../ContextModules/MessagingModule';

type MessageInputContainerProps = {
    onMessageSend: (message: Message) => void,
};
export default function MessageInputContainer({ onMessageSend }: MessageInputContainerProps): h.JSX.Element {
    const [currentMessage, setCurrentMessage] = useState('');
    const { nickname } = Messaging.useState();
    const messagingDispatch = Messaging.useDispatch();
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            const message = {
                author: nickname,
                content: currentMessage,
                date: Date.now(),
            };
            messagingDispatch(Messaging.addMessage(message));
            onMessageSend(message);
            setCurrentMessage('');
        }}>
            <label htmlFor="current-message">
                {nickname}:
            </label>
            <input
                id="current-message"
                name="current-message"
                type="text"
                value={currentMessage}
                placeholder="Your message..."
                onInput={(e) => {
                    e.preventDefault();
                    setCurrentMessage(e.currentTarget.value);
                }}
            />
        </form>
    );
}