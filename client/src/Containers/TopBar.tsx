import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerClient from '../Hooks/PeerClientContext';
import useMessaging from '../Hooks/MessagingContext';

import TopBarComponent from '../Components/TopBar';

import { CONNECTION_STATUS } from '../lib/Connections';
import Button from '../Components/Button';
import { Color } from '../Components/Variables';

export default function TopBar(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const {
        localStream,
        removeAudioStream,
        addAudioStream,
        removeVideoStream,
        addVideoStream,
    } = usePeerClient();
    const { notificationPermission, toggleNotificationPermission } = useMessaging();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;
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