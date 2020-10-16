import { h } from 'preact';
import Button, { NodeType } from '../Components/Button';

import useIdentities from '../Hooks/IdentitiesContext';

import { FlexContainer, FlexDirection, Logo } from '../Components/Utilities';
import { Color, Size } from '../Components/Variables';

import CONFIGURATION from '../config';

export default function HomePage(): h.JSX.Element {
    const { currentIdentity } = useIdentities();
    const randomRoomName = Math.random().toString(36).substring(7);
    return (
        <FlexContainer
            direction={FlexDirection.COLUMN}
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            <div className="m-a">
                <Logo size={Size.LARGE} className="m-a" />
                <h1 className="c-special-title">{CONFIGURATION.appName}</h1>
                <h2 className="c-special-subtitle">Privacy-first messaging app</h2>
                <div>
                    <Button
                        nodeType={NodeType.A}
                        color={Color.PRIMARY}
                        href={`/join/${randomRoomName}`}
                        size={Size.LARGE}
                    >
                        Create a room as {currentIdentity?.name ?? 'unknown'}
                    </Button>
                </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
                Made with ❤ in Lyon, France
            </div>
        </FlexContainer>
    );
}