import SimplePeer from "simple-peer";
import { EventData } from "./lib/EventEmitter";

export const NAMES = {
    RoomJoin: 'roomJoin',
    RoomJoined: 'roomJoined',
    RoomLeft: 'roomLeft',
    JoinOffer: 'joinOffer',
    JoinAnswer: 'joinAnswer',
    PeerSignal: 'peerSignal',
};

/*
 * SERVER MESSAGES
 */
export interface RoomJoin {
    roomName: string
    nickname: string
}

export interface RoomJoined {
    roomName: string
    nickname: string
    isInitiator: boolean
}
export interface RoomJoinedEventData extends RoomJoined, EventData {}

export interface RoomLeft {
    roomName: string
    nickname: string
}
export interface RoomLeftEventData extends RoomLeft, EventData {}

/*
 * PEER MESSAGES
 */
export const enum PEER_MESSAGE_TYPE {
    SIGNAL = 'signal',
    TEXT_MESSAGE = 'text_message',
}
export interface PeerMessage {
    type: PEER_MESSAGE_TYPE
}
export interface TextMessage extends PeerMessage {
    type: PEER_MESSAGE_TYPE.TEXT_MESSAGE,
    author: string
    content: string
    date: number
}
export interface PeerSignal extends PeerMessage {
    type: PEER_MESSAGE_TYPE.SIGNAL,
    data: SimplePeer.SignalData,
}
export interface TextMessageEventData extends TextMessage, EventData {}

export interface PeerSignalEventData extends SimplePeer.SignalData, EventData {}
export interface RemoteStreamChangedEventData extends EventData {
    stream: MediaStream | null
}
export interface LocalStreamChangedEventData extends EventData {
    stream: MediaStream | null
}
