import { h } from 'preact';
import { useState } from 'preact/hooks';
import Button, { NodeType } from '../Components/Button';
import Input from '../Components/Input';
import { FlexContainer, FlexDirection, Logo } from '../Components/Utilities';
import { Color, Size } from '../Components/Variables';

import useIdentities from '../Hooks/IdentitiesContext';

type OnBoardingContainerProps = h.JSX.ElementChildrenAttribute;

const enum STEPS {
    INTRODUCTION,
    IDENTITY_CREATION,
}

export default function OnBoardingContainer({ children }: OnBoardingContainerProps): h.JSX.Element {
    const { currentIdentity, generateIdentity } = useIdentities();
    // Identity already set, no onboarding needed
    if (currentIdentity !== null) {
        return children;
    }
    const [currentStep, setCurrentStep] = useState(STEPS.INTRODUCTION);
    const [newIdentityName, setNewIdentityName] = useState('');
    let content = null;
    switch (currentStep) {
        case STEPS.INTRODUCTION:
            content = (
                <div>
                    <FlexContainer horizontalCenter direction={FlexDirection.COLUMN}>
                        <Logo size={Size.LARGE} className="m-a" />
                        <h1>Welcome on Vispeer!</h1>
                    </FlexContainer>
                    <FlexContainer horizontalCenter>
                        <Button
                            color={Color.PRIMARY}
                            onClick={() => setCurrentStep(STEPS.IDENTITY_CREATION)}
                        >
                            Next
                        </Button>
                    </FlexContainer>
                </div>
            );
            break;
        case STEPS.IDENTITY_CREATION:
            content = (
                <div>
                    <h1>First, you need to generate your own identity</h1>
                    <FlexContainer horizontalCenter>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            generateIdentity(newIdentityName)
                        }}>
                            <label htmlFor="identity-name">
                                Nickname
                            </label>
                            <Input
                                id="identity-name"
                                name="identity-name"
                                type="text"
                                value={newIdentityName}
                                onChange={(e) => setNewIdentityName(e.currentTarget.value)}
                            />
                        </form>
                        <Button
                            nodeType={NodeType.INPUT}
                            type="submit"
                            color={Color.PRIMARY}
                            value="Generate"
                        />
                    </FlexContainer>
                </div>
            );
            break;
    }
    return (
        <FlexContainer horizontalCenter verticalCenter>
            {content}
        </FlexContainer>
    );
}