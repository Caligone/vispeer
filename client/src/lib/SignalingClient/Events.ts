import SimplePeer from 'simple-peer';

import { CONNECTION_STATUS } from '../Connections';

export interface RoomJoin {
    roomName: string,
    nickname: string,
}

export interface RoomJoined {
    roomName: string,
    nickname: string,
    isInitiator: boolean,
}

export interface RoomLeft {
    roomName: string,
    nickname: string,
}

export interface PeerSignal {
    data: SimplePeer.SignalData,
}

export interface ConnectionStatusChanged {
    status: CONNECTION_STATUS,
}