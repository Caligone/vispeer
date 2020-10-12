import { h } from 'preact';
import { FlexContainer, FlexDirection } from './Utilities';

type LoadingScreenProps = {
    children: h.JSX.Element | Array<h.JSX.Element>,
};

export default function LoadingScreen({ children }: LoadingScreenProps): h.JSX.Element {
    return (
        <FlexContainer
            direction={FlexDirection.ROW}
            verticalCenter
            horizontalCenter
            className='u-width__full u-height__full u-text__center'
        >
            {children}
        </FlexContainer>
    )
}