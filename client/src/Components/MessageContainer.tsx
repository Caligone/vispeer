import { h } from 'preact';

import { Message } from '../@types/Messaging';

type MessageComponentProps = {
    message: Message,
};

export default function MessageComponent({ message }: MessageComponentProps): h.JSX.Element {
    return (
        <div>
            <p>
                {(new Date(message.date)).toLocaleTimeString()}
                {' '}
                <strong>{message.author}</strong> {message.content}
            </p>
        </div>
    );
}