import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import useMessaging, { Message } from '../Hooks/MessagingContext';
import usePeerClient from '../Hooks/PeerClientContext';

import MessagesContainer from '../Components/MessagesContainer';
import MessageInputContainer from './MessageInputContainer';
import Topbar from './TopBar';

import { CONNECTION_STATUS } from '../lib/Connections';
import { FlexContainer, FlexDirection } from '../Components/Utilities';
import RemoteVideoContainer from './RemoteVideoContainer';

export default function MessagingContainer(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const { messages } = useMessaging();
    const { sendTextMessage } = usePeerClient();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;
    return (
        <FlexContainer direction={FlexDirection.COLUMN} style={{ height: '100%' }}>
            <Topbar />
            <RemoteVideoContainer />
            <MessagesContainer messages={messages} />
            <MessageInputContainer onMessageSend={(message: Message) => {
                sendTextMessage(message);
            }} />
        </FlexContainer>
    );
}