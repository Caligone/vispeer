import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerClient from '../Hooks/PeerClientContext';

import { CONNECTION_STATUS } from '../@types/Connections';
import { useEffect } from 'preact/hooks';
import { FlexContainer } from '../Components/Utilities';

export default function RemoteVideoContainer(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const { remoteStream } = usePeerClient();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;

    let videoRef: HTMLAudioElement | null = null;
    useEffect(() => {
        if (!videoRef) return;
        videoRef.srcObject = remoteStream;
    }, [remoteStream]);
    const hasAudioTrack = remoteStream !== null && remoteStream.getAudioTracks().length > 0;
    const hasVideoTrack = remoteStream !== null && remoteStream.getVideoTracks().length > 0;

    if (!hasAudioTrack && !hasVideoTrack) return null;
    return (
        <FlexContainer>
            <video
                autoPlay
                className="m-a"
                ref={(ref) => videoRef = ref }
            />
        </FlexContainer>
    );
}