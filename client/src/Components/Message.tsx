import { h } from 'preact';

import './Message.scss';

import AttachementsContainer from './AttachementsContainer';
import { Message, MESSAGE_TYPES } from '../Hooks/MessagingContext';

type MessageProps = {
    message: Message,
};

function getClassNameFromMessage(message: Message) {
    const classNames = ['c-message'];
    switch (message.type) {
        case MESSAGE_TYPES.INTERNAL:
            classNames.push('c-message--internal');
            break;
        case MESSAGE_TYPES.LOCAL:
            classNames.push('c-message--local');
            break;
        case MESSAGE_TYPES.REMOTE:
            classNames.push('c-message--remote');
            break;
        default:
            throw new Error('Invalid message type')
    }
    return classNames.join(' ');
}

export default function Message({ message }: MessageProps): h.JSX.Element {
    return (
        <div className={getClassNameFromMessage(message)} title={(new Date(message.date)).toISOString()}>
            <span className="c-message__time">
                {(new Date(message.date)).toLocaleTimeString()}
            </span>
            <div className="c-message__content">
                <AttachementsContainer currentMessage={message} />
                {message.content}
            </div>
        </div>
    );
}