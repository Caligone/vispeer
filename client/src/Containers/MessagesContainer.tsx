import { h } from 'preact';
import * as Messaging from '../ContextModules/MessagingModule';

import MessagesComponent from '../Components/Message';

export default function MessagesContainer(): h.JSX.Element {
    const { messages } = Messaging.useState();
    return (
        <div>
            {messages.map((message) => <MessagesComponent message={message} />)}
        </div>
    );
}