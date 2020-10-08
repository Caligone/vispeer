import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import useMessaging from '../Hooks/MessagingContext';
import usePeerClient from '../Hooks/PeerClientContext';

import MessagesContainer from '../Components/MessagesContainer';
import MessageInputContainer from './MessageInputContainer';
import Topbar from './TopBar';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Message } from '../@types/Messaging';
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