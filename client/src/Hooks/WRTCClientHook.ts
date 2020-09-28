import { useRef } from 'preact/hooks';

import WRTCClient from '../lib/WRTCClient';

export default function useWebRTCClient(): WRTCClient {
    const { current: wrtcClientRef } = useRef(new WRTCClient());
    return wrtcClientRef;
}