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
export interface TextMessage {
    author: string
    content: string
    date: number
}
export interface TextMessageEventData extends TextMessage, EventData {}

export interface PeerSignalEventData extends SimplePeer.SignalData, EventData {}
