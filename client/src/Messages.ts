import SimplePeer from "simple-peer";
import { Message } from "./@types/Messaging";
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
    REMOTE_AUDIO_ADDED = 'remote_audio_added',
    REMOTE_AUDIO_REMOVED = 'remote_audio_removed',
    REMOTE_VIDEO_ADDED = 'remote_video_added',
    REMOTE_VIDEO_REMOVED = 'remote_video_removed',
    LOCAL_AUDIO_ADDED = 'local_audio_added',
    LOCAL_AUDIO_REMOVED = 'local_audio_removed',
    LOCAL_VIDEO_ADDED = 'local_video_added',
    LOCAL_VIDEO_REMOVED = 'local_video_removed',
}
export interface PeerMessage {
    type: PEER_MESSAGE_TYPE
}
export interface TextMessage extends PeerMessage {
    type: PEER_MESSAGE_TYPE.TEXT_MESSAGE,
    message: Message,
}
export interface PeerSignal extends PeerMessage {
    type: PEER_MESSAGE_TYPE.SIGNAL,
    data: SimplePeer.SignalData,
}
export interface CloseAudioStream extends PeerMessage {
    type: PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED,
}
export interface CloseVideoStream extends PeerMessage {
    type: PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED,
}
export interface TextMessageEventData extends TextMessage, EventData {}

export interface PeerSignalEventData extends SimplePeer.SignalData, EventData {}
export interface RemoteStreamChangedEventData extends EventData {
    eventName: PEER_MESSAGE_TYPE.REMOTE_AUDIO_ADDED
             | PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED
             | PEER_MESSAGE_TYPE.REMOTE_VIDEO_ADDED
             | PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED
    stream: MediaStream | null
}
export interface LocalStreamChangedEventData extends EventData {
    eventName: PEER_MESSAGE_TYPE.LOCAL_AUDIO_ADDED
             | PEER_MESSAGE_TYPE.LOCAL_AUDIO_REMOVED
             | PEER_MESSAGE_TYPE.LOCAL_VIDEO_ADDED
             | PEER_MESSAGE_TYPE.LOCAL_VIDEO_REMOVED
    stream: MediaStream | null
}
