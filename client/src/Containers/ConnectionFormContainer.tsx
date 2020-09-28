import { h } from 'preact';

import * as ConnectionStatus from '../Hooks/ConnectionsModule';
import * as Messaging from '../Hooks/MessagingModule';

import { CONNECTION_STATUS } from '../@types/Connections';

import Button, { Color, NodeType } from '../Components/Button';
import { FlexContainer } from '../Components/Utilities';

type ConnectionFormContainerType = {
    onSubmit: h.JSX.GenericEventHandler<HTMLFormElement>,
};

export default function ConnectionFormContainer({ onSubmit }: ConnectionFormContainerType): h.JSX.Element | null {
    const { wsStatus } = ConnectionStatus.useState();
    const { roomName } = Messaging.useState();

    if (wsStatus !== CONNECTION_STATUS.IDLE) return null;
    
    return (
        <FlexContainer
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            <div>
                <h1>{roomName}</h1>
                <form onSubmit={onSubmit}>
                    <Button
                        nodeType={NodeType.INPUT}
                        color={Color.PRIMARY}
                        type="Submit"
                        value="Connect"
                    />
                </form>
            </div>
        </FlexContainer>
    );
}