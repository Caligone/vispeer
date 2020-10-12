import { Fragment, h } from 'preact';

import IdentitiesListContainer from '../Containers/IdentitiesListContainer';
import TopBar from '../Containers/TopBar';

export default function IdentitiesPage(): h.JSX.Element {
    return (
        <Fragment>
            <TopBar />
            <IdentitiesListContainer />
        </Fragment>
    );
}