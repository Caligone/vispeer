import { h } from 'preact';

import './MessagesContainer.scss';

import MessageComponent from './Message';

import { Message } from '../@types/Messaging';

type MessageProps = {
    messages: Array<Message>,
};

export default function Message({ messages }: MessageProps): h.JSX.Element {
    return (
        <div className="c-messages-container">
            {messages.map((message) => <MessageComponent message={message} />)}
        </div>
    );
}