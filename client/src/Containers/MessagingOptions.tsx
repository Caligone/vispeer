import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerClient from '../Hooks/PeerClientContext';

import { CONNECTION_STATUS } from '../@types/Connections';
import { useEffect } from 'preact/hooks';

export default function MessagingOptions(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const { peerClient, remoteStream, localStream } = usePeerClient();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;

    let videoRef: HTMLAudioElement | null = null;
    useEffect(() => {
        if (!videoRef) return;
        videoRef.srcObject = remoteStream;
    }, [remoteStream])
    const hasAudioTrack = localStream !== null && localStream.getAudioTracks().length > 0;
    const hasVideoTrack = localStream !== null && localStream.getVideoTracks().length > 0;
    return (
        <div style={{ position: 'absolute' }}>
            {
                hasAudioTrack
                ? <a onClick={() => peerClient.removeAudioStream()}>Close audio channel</a>
                : <a onClick={() => peerClient.addAudioStream()}>Open audio channel</a>
            }
            {
                hasVideoTrack
                ? <a onClick={() => peerClient.removeVideoStream()}>Close video channel</a>
                : <a onClick={() => peerClient.addVideoStream()}>Open video channel</a>
            }
            <video ref={(ref) => videoRef = ref } autoPlay />
        </div>
    );
}