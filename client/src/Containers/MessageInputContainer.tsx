import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import MessageInput from '../Components/MessageInput';

import useMessaging, { ATTACHEMENT_TYPES, Message, MESSAGE_TYPES } from '../Hooks/MessagingContext';
import useConnections from '../Hooks/ConnectionsContext';
import { CONNECTION_STATUS } from '../lib/Connections';
import AttachementsContainer from '../Components/AttachementsContainer';

type MessageInputContainerProps = {
    onMessageSend: (message: Message) => void,
};

const defaultMessage: Message = {
    type: MESSAGE_TYPES.LOCAL,
    author: '',
    content: '',
    attachements: [],
    date: 0,
}

export default function MessageInputContainer({ onMessageSend }: MessageInputContainerProps): h.JSX.Element {
    const { nickname, addMessage } = useMessaging();
    const { peerConnectionStatus } = useConnections();
    const [currentMessage, setCurrentMessage] = useState<Message>({
        ...defaultMessage,
        author: nickname,
    });
    return (
        <Fragment>
            <AttachementsContainer
                currentMessage={currentMessage}
                onAttachementRemove={(identifier) => {
                    setCurrentMessage({
                        ...currentMessage,
                        attachements: currentMessage.attachements.filter(a => (
                            a.identifier !== identifier
                        )),
                    });
                }}
            />
            <MessageInput
                currentMessage={currentMessage}
                isDisabled={peerConnectionStatus !== CONNECTION_STATUS.CONNECTED}
                onSubmit={() => {
                    if (currentMessage.content.length === 0 
                     && currentMessage.attachements.length === 0) {
                        return;
                    }
                    const message = {
                        ...currentMessage,
                        date: Date.now(),
                    };
                    addMessage(message);
                    onMessageSend(message);
                    setCurrentMessage({
                        ...defaultMessage,
                        author: nickname,
                    });
                }}
                onInput={(e) => {
                    e.preventDefault();
                    setCurrentMessage({
                        ...currentMessage,
                        content: e.currentTarget.value
                    });
                }}
                onAttachementAdd={(base64Data: string) => {
                    setCurrentMessage({
                        ...currentMessage,
                        attachements: [
                            ...currentMessage.attachements,
                            {
                                identifier: Math.random().toString(36).substring(7),
                                type: ATTACHEMENT_TYPES.IMAGE,
                                data: base64Data
                            }
                        ]
                    });
                }}
            />
        </Fragment>
    );
}