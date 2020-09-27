import { h } from 'preact';
import WRTCClientContainer from '../Containers/WRTCClientContainer';

type JoinPageProps = {
    roomName: string
}

export default function JoinPage({ roomName }: JoinPageProps): h.JSX.Element {
    return (
        <WRTCClientContainer roomName={roomName} />
    );
}