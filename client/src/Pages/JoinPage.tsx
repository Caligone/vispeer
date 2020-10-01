import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';
import ConnectionFormContainer from '../Containers/ConnectionFormContainer';
import MessagingContainer from '../Containers/MessagingContainer';
import useMessaging from '../Hooks/MessagingContext';

type JoinPageProps = {
    roomName: string
}

export default function JoinPage({ roomName }: JoinPageProps): h.JSX.Element {
    const { setRoomName } = useMessaging();
    useEffect(() => {
        setRoomName(roomName);
    }, [roomName])
    return (
        <Fragment>
            <ConnectionFormContainer />
            <MessagingContainer />
        </Fragment>
    );
}