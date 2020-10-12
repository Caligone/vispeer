import SimplePeer from 'simple-peer';

interface RoomJoin {
    roomName: string,
    name: string,
}

interface RoomJoined {
    roomName: string,
    name: string,
    isInitiator: boolean,
}

interface RoomLeft {
    roomName: string,
    name: string,
}

interface PeerSignal {
    data: SimplePeer.SignalData,
}

export const enum MESSAGE_TYPES {
    ROOM_JOIN ='roomJoin',
    ROOM_JOINED ='roomJoined',
    ROOM_LEFT ='roomLeft',
    PEER_SIGNAL ='peerSignal',
}

export interface ServerMessage {
    type: MESSAGE_TYPES,
}

export interface RoomJoinMessage extends RoomJoin, ServerMessage {
    type: MESSAGE_TYPES.ROOM_JOIN,
}

export interface RoomJoinedMessage extends RoomJoined, ServerMessage {
    type: MESSAGE_TYPES.ROOM_JOINED,
}

export interface PeerSignalMessage extends PeerSignal, ServerMessage {
    type: MESSAGE_TYPES.PEER_SIGNAL,
}

export interface RoomLeftMessage extends RoomLeft, ServerMessage {
    type: MESSAGE_TYPES.ROOM_LEFT,
}