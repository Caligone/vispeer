import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import useMessaging from '../Hooks/MessagingContext';
import usePeerClient from '../Hooks/PeerClientContext';

import { CONNECTION_STATUS } from '../@types/Connections';

import Button, { Color, NodeType } from '../Components/Button';
import { FlexContainer } from '../Components/Utilities';

export default function ConnectionFormContainer(): h.JSX.Element | null {
    const { serverConnectionStatus, serverUrl } = useConnections();
    const { roomName } = useMessaging();
    const { peerClient } = usePeerClient();

    if (serverConnectionStatus !== CONNECTION_STATUS.IDLE) return null;
    
    return (
        <FlexContainer
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            <div>
                <h1>{roomName}</h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    peerClient.connect(serverUrl);
                }}>
                    <Button
                        nodeType={NodeType.INPUT}
                        color={Color.PRIMARY}
                        type="Submit"
                        value="Connect"
                    />
                </form>
            </div>
        </FlexContainer>
    );
}