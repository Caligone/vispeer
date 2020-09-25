import { h } from 'preact';

import { CONNECTION_STATUS } from '../@types/Connections';

import './ConnectionStatus.scss';

type ComponentProps = {
    name: string,
    status: CONNECTION_STATUS,
};

function getStatusConnectionLightClassName(status: CONNECTION_STATUS): string {
    const classNames = ['c-connection-status__light'];
    switch (status) {
        case CONNECTION_STATUS.IDLE:
            classNames.push('c-connection-status__light--idle');
            break;
        case CONNECTION_STATUS.CONNECTING:
            classNames.push('c-connection-status__light--connecting');
            break;
        case CONNECTION_STATUS.CONNECTED:
            classNames.push('c-connection-status__light--connected');
            break;
        case CONNECTION_STATUS.DISCONNECTED:
            classNames.push('c-connection-status__light--disconnected');
            break;
    }
    return classNames.join(' ');
}

export default function ConnectionStatus({
    name,
    status
}: ComponentProps): h.JSX.Element {
    return (
        <div className="c-connection-status">
            {name}
            <span title={status} className={getStatusConnectionLightClassName(status)} />
        </div>
    );
}