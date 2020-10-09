import {
    RoomJoin,
    RoomJoined,
    PeerSignal,
    RoomLeft,
} from "./Events";

export const enum MESSAGE_TYPES {
    ROOM_JOIN ='roomJoin',
    ROOM_JOINED ='roomJoined',
    ROOM_LEFT ='roomLeft',
    PEER_SIGNAL ='peerSignal',
}

interface ServerMessage {
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