import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import useMessaging from '../Hooks/MessagingContext';
import usePeerConnection from '../Hooks/PeerConnectionContext';
import useIdentities from '../Hooks/IdentitiesContext';

import { CONNECTION_STATUS } from '../lib/Connections';

import Button, { NodeType } from '../Components/Button';
import { FlexContainer, FlexDirection } from '../Components/Utilities';
import { Color, Size } from '../Components/Variables';

export default function ConnectionFormContainer(): h.JSX.Element | null {
    const { serverConnectionStatus, peerConnectionStatus, serverUrl } = useConnections();
    const { roomName } = useMessaging();
    const { connect } = usePeerConnection();
    const { currentIdentity } = useIdentities();
    if (peerConnectionStatus === CONNECTION_STATUS.CONNECTED) return null;

    let content = null;
    if (serverConnectionStatus === CONNECTION_STATUS.IDLE) {
        content = (
            <div>
                <h1>Ready to join <em>{roomName}</em></h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    connect(serverUrl);
                }}>
                    <Button
                        nodeType={NodeType.INPUT}
                        color={Color.PRIMARY}
                        size={Size.LARGE}
                        type="Submit"
                        value={`Connect as ${currentIdentity?.name ?? 'unknown'}`}
                    />
                </form>
            </div>
        );
    } else {
        if (serverConnectionStatus === CONNECTION_STATUS.CONNECTING) {
            content = <h3>Connecting to the signaling server...</h3>
        } else if (serverConnectionStatus === CONNECTION_STATUS.CONNECTED) {
            content = <h3>Waiting for your peer...</h3>
        } else {
            content = <h3>Connecting to your peer..</h3>
        }

    }
    
    return (
        <FlexContainer
            direction={FlexDirection.ROW}
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            {content}
        </FlexContainer>
    );
}