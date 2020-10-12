import SimplePeer from 'simple-peer';

import { CONNECTION_STATUS } from '../Connections';

export interface RoomJoin {
    roomName: string,
    name: string,
}

export interface RoomJoined {
    roomName: string,
    name: string,
    isInitiator: boolean,
}

export interface RoomLeft {
    roomName: string,
    name: string,
}

export interface PeerSignal {
    data: SimplePeer.SignalData,
}

export interface ConnectionStatusChanged {
    status: CONNECTION_STATUS,
}