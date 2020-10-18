import { Fragment, h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerConnection from '../Hooks/PeerConnectionContext';
import useMessaging from '../Hooks/MessagingContext';

import TopBarComponent from '../Components/TopBar';

import { CONNECTION_STATUS } from '../lib/Connections';
import Button, { NodeType } from '../Components/Button';
import { Color } from '../Components/Variables';

export default function TopBar(): h.JSX.Element {
    const { peerConnectionStatus } = useConnections();
    const {
        localStream,
        removeAudioStream,
        addAudioStream,
        removeVideoStream,
        addVideoStream,
    } = usePeerConnection();
    const {
        notificationPermission,
        toggleNotificationPermission,
        roomName,
    } = useMessaging();
    const hasAudioTrack = localStream !== null && localStream.getAudioTracks().length > 0;
    const hasVideoTrack = localStream !== null && localStream.getVideoTracks().length > 0;

    function toggleAudio(): void {
        hasAudioTrack
            ? removeAudioStream()
            : addAudioStream();
    }

    function toggleVideo() {
        hasVideoTrack
            ? removeVideoStream()
            : addVideoStream();
    }

    return (
        <TopBarComponent>
            { peerConnectionStatus === CONNECTION_STATUS.CONNECTED ?
                <Fragment>
                    <Button
                        color={Color.PRIMARY}
                        active={hasAudioTrack}
                        onClick={toggleAudio}
                    >
                        Audio
                    </Button>
                    <Button
                        color={Color.PRIMARY}
                        active={hasVideoTrack}
                        onClick={toggleVideo}
                    >
                        Video
                    </Button>
                    <Button
                        color={Color.PRIMARY}
                        active={notificationPermission === 'granted'}
                        onClick={toggleNotificationPermission}
                    >
                        Notifications
                    </Button>
                </Fragment>
            : null}
            <Button
                color={Color.PRIMARY}
                nodeType={NodeType.A}
                href="/identities"
            >
                Identities
            </Button>
            <Button
                color={Color.PRIMARY}
                nodeType={NodeType.A}
                href={`/join/${roomName}`}
            >
                Room
            </Button>
        </TopBarComponent>
    );
}