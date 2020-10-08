import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerClient from '../Hooks/PeerClientContext';
import useMessaging from '../Hooks/MessagingContext';

import TopBarComponent from '../Components/TopBar';

import { CONNECTION_STATUS } from '../@types/Connections';
import Button from '../Components/Button';
import { Color } from '../Components/Variables';

export default function TopBar(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const { peerClient, localStream } = usePeerClient();
    const { notificationPermission, toggleNotificationPermission } = useMessaging();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;
    const hasAudioTrack = localStream !== null && localStream.getAudioTracks().length > 0;
    const hasVideoTrack = localStream !== null && localStream.getVideoTracks().length > 0;

    function toggleAudio(): void {
        hasAudioTrack
            ? peerClient.removeAudioStream()
            : peerClient.addAudioStream();
    }

    function toggleVideo() {
        hasVideoTrack
            ? peerClient.removeVideoStream()
            : peerClient.addVideoStream();
    }

    return (
        <TopBarComponent>
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
        </TopBarComponent>
    );
}