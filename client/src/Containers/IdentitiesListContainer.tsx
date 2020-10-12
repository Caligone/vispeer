import { h } from 'preact';
import Button from '../Components/Button';
import { FlexContainer } from '../Components/Utilities';
import { Color, Size } from '../Components/Variables';

import useIdentities from '../Hooks/IdentitiesContext';
import IdentityListItem from './IdentityListItem';

export default function IdentitiesListContainer(): h.JSX.Element {
    const { identities, generateIdentity } = useIdentities();
    return (
        <div>
            <FlexContainer verticalCenter>
                <h3>Identities</h3>
                <div>
                    <Button
                        color={Color.PRIMARY}
                        size={Size.SMALL}
                        onClick={generateIdentity}
                    >
                        Generate
                    </Button>
                </div>
            </FlexContainer>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Export</th>
                    <th>Actions</th>
                </tr>
                {identities.map((identity) => (
                    <IdentityListItem identity={identity} />
                ))}
            </table>
        </div>
    )
}