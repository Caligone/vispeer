import { h } from 'preact';

import { Message } from '../@types/Messaging';

type MessageProps = {
    message: Message,
};

export default function Message({ message }: MessageProps): h.JSX.Element {
    return (
        <p>
            {(new Date(message.date)).toLocaleTimeString()}
            {' '}
            <strong>{message.author}</strong> {message.content}
        </p>
    );
}