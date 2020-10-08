import { h } from 'preact';
import { Message } from '../@types/Messaging';

import './MessageInput.scss';

type MessageInputProps = {
    currentMessage: Message,
    isDisabled: boolean,
    onSubmit: () => void,
    onInput: (_: h.JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void,
    onAttachementAdd: (_: string) => void,
};

async function convertFileToBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof(reader.result) === 'string') {
                resolve(reader.result);
            }
            reject('invalid format');
        }
        reader.onerror = error => reject(error);
    });
}

export default function MessageInput({
    currentMessage,
    isDisabled,
    onSubmit,
    onInput,
    onAttachementAdd,
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
                value={currentMessage.content}
                placeholder={isDisabled ? 'Waiting for your peer...' : 'Type in your message...'}
                disabled={isDisabled}
                onInput={onInput}
                onKeyPress={(e) => {
                    if(e.which === 13 && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
                onPaste={(e) => {
                    if (!e.clipboardData) return;
                    for (let i = 0; i < e.clipboardData.items.length; i++) {
                        const item = e.clipboardData.items[i];
                        if (item.type.indexOf('image') === -1) continue;
                        const imageFile = item.getAsFile();
                        if (!imageFile) continue;
                        convertFileToBase64(imageFile).then((base64Image) => {
                            if (!base64Image) return;
                            onAttachementAdd(base64Image)
                        })
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