import { h } from 'preact';

import * as ConnectionStatus from '../ContextModules/ConnectionsModule';
import * as Messaging from '../ContextModules/MessagingModule';

import { CONNECTION_STATUS } from '../@types/Connections';

type ConnectionFormContainerType = {
    onSubmit: h.JSX.GenericEventHandler<HTMLFormElement>,
};

export default function ConnectionFormContainer({ onSubmit }: ConnectionFormContainerType): h.JSX.Element | null {
    const connectionStatusDispatch = ConnectionStatus.useDispatch();
    const messagingDispatch = Messaging.useDispatch();
    const { wsStatus, serverUrl } = ConnectionStatus.useState();
    const { nickname } = Messaging.useState();

    if (wsStatus !== CONNECTION_STATUS.IDLE) return null;
    
    return (
        <form onSubmit={onSubmit}>
            <label htmlFor="nickname">Nickname</label>
            <input
                id="nickname"
                name="nickname"
                type="text"
                value={nickname}
                onInput={(e) => {
                    e.preventDefault();
                    const nicknameAction = Messaging.setNickname(e.currentTarget.value);
                    messagingDispatch(nicknameAction);
                }}
            />
            <label htmlFor="server-url">Signaling server url</label>
            <input
                id="server-url"
                name="server-url"
                type="url"
                value={serverUrl}
                onInput={(e) => {
                    e.preventDefault();
                    const serverUrlAction = ConnectionStatus.setServerUrl(e.currentTarget.value);
                    connectionStatusDispatch(serverUrlAction);
                }}
            />
            <input type="Submit" value="Connect" />
        </form>
    );
}