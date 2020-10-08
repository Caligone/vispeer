import { h } from 'preact';
import { Message } from '../@types/Messaging';

import './AttachementsContainer.scss';
import { FlexContainer } from './Utilities';

type AttachementsContainerProps = {
    currentMessage: Message,
    onAttachementRemove?: (_: string) => void,
};


export default function AttachementsContainer({
    currentMessage,
    onAttachementRemove,
}: AttachementsContainerProps): h.JSX.Element | null {
    if (currentMessage.attachements.length === 0) return null;
    const classNames = [
        'c-attachements-container',
        onAttachementRemove !== null ? 'c-attachements-container__removable' : ''
    ];
    return (
        <FlexContainer
            className={classNames.join(' ')}
            horizontalCenter
            verticalCenter
        >
            {currentMessage.attachements.map((attachement) => {
                return (
                    <img
                        key={attachement.identifier}
                        src={attachement.data}
                        onClick={(e) => {
                            e.preventDefault();
                            if (!onAttachementRemove) return;
                            onAttachementRemove(attachement.identifier);
                        }}
                    />
                );
            })}
        </FlexContainer>
    );
}