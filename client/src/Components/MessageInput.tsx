import { h } from 'preact';

import './MessageInput.scss';

type MessageInputProps = {
    currentMessage: string,
    isDisabled: boolean,
    onSubmit: () => void,
    onInput: (e: h.JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void,
};

export default function MessageInput({
    currentMessage,
    isDisabled,
    onSubmit,
    onInput,
}: MessageInputProps): h.JSX.Element {
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }} className="c-message-input-container">
            <label
                htmlFor="current-message"
                className="c-message-input-label"
            >
                Message
            </label>
            <textarea
                id="current-message"
                name="current-message"
                className="c-message-input"
                type="text"
                value={currentMessage}
                placeholder={isDisabled ? 'Waiting for your peer...' : 'Type in your message...'}
                disabled={isDisabled}
                onInput={onInput}
                onKeyPress={(e) => {
                    if(e.which === 13 && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
            />
            <button
                type="submit"
                className="c-message-input-submit"
                disabled={isDisabled}
            >
                Send
            </button>
        </form>
    );
}