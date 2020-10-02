import { h } from 'preact';

import useConnections from '../Hooks/ConnectionsContext';
import usePeerClient from '../Hooks/PeerClientContext';

import { CONNECTION_STATUS } from '../@types/Connections';
import { useEffect } from 'preact/hooks';

export default function MessagingOptions(): h.JSX.Element | null {
    const { peerConnectionStatus } = useConnections();
    const { peerClient, remoteStream, localStream } = usePeerClient();
    if (peerConnectionStatus !== CONNECTION_STATUS.CONNECTED) return null;

    let audioRef: HTMLAudioElement | null = null;
    useEffect(() => {
        if (!remoteStream || !audioRef) return;
        audioRef.srcObject = remoteStream;
    }, [remoteStream])
    return (
        <div style={{ position: 'absolute' }}>
            {
                localStream !== null
                ? <a onClick={() => peerClient.removeAudioStream()}>Close audio channel</a>
                : <a onClick={() => peerClient.addAudioStream()}>Open audio channel</a>
            }
            <audio ref={(ref) => audioRef = ref } autoPlay />
        </div>
    );
}