import { h } from 'preact';

import './MessageInput.scss';

type MessageProps = {
    currentMessage: string,
    isDisabled: boolean,
    onSubmit: (e: h.JSX.TargetedEvent<HTMLFormElement, Event>) => void,
    onInput: (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => void,
};

export default function MessageInput({
    currentMessage,
    isDisabled,
    onSubmit,
    onInput,
}: MessageProps): h.JSX.Element {
    return (
        <form onSubmit={onSubmit} className="c-message-input-container">
            <label htmlFor="current-message">
                Message
            </label>
            <input
                id="current-message"
                name="current-message"
                className="c-message-input"
                type="text"
                value={currentMessage}
                placeholder={isDisabled ? 'Waiting for your peer...' : '...'}
                disabled={isDisabled}
                onInput={onInput}
            />
        </form>
    );
}