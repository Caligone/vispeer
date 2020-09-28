import { h } from 'preact';
import Button, { Color, NodeType } from '../Components/Button';

import { FlexContainer, Logo, Size } from '../Components/Utilities';

import CONFIGURATION from '../config';

export default function HomePage(): h.JSX.Element {
    const randomRoomName = Math.random().toString(36).substring(7);
    return (
        <FlexContainer
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            <div>
                <Logo size={Size.LARGE} />
                <h1 className="c-special-title">{CONFIGURATION.appName}</h1>
                <div>
                    <Button
                        nodeType={NodeType.A}
                        color={Color.PRIMARY}
                        href={`/join/${randomRoomName}`}
                    >
                        Create a room
                    </Button>
                </div>
            </div>
        </FlexContainer>
    );
}