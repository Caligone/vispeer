import SimplePeer from 'simple-peer';

import {
    TextMessageReceived,
    LocalAudioStreamAdded,
    LocalAudioStreamRemoved,
    LocalVideoStreamAdded,
    LocalVideoStreamRemoved,
    RemoteAudioStreamAdded,
    RemoteAudioStreamRemoved,
    RemoteVideoStreamAdded,
    RemoteVideoStreamRemoved,
} from './Events';

export const enum MESSAGE_TYPES {
    SIGNAL = 'signal',
    TEXT_MESSAGE = 'text_message',
    CRYPTO_KEY = 'crypto_key',
    // Streaming
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
    type: MESSAGE_TYPES
}
export interface EncryptedTextMessageReceivedMessage extends PeerMessage {
    type: MESSAGE_TYPES.TEXT_MESSAGE,
    author: string,
    message: string,
}
export interface TextMessageReceivedMessage extends PeerMessage, TextMessageReceived {
    type: MESSAGE_TYPES.TEXT_MESSAGE,
}
export interface PeerSignalMessage extends PeerMessage {
    type: MESSAGE_TYPES.SIGNAL,
    data: SimplePeer.SignalData,
}
export interface CryptoKeyMessage extends PeerMessage {
    type: MESSAGE_TYPES.CRYPTO_KEY,
    name: string,
    publicKey: JsonWebKey,
}

export interface LocalAudioStreamAddedMessage extends PeerMessage, LocalAudioStreamAdded {
    type: MESSAGE_TYPES.LOCAL_AUDIO_ADDED,
}
export interface LocalAudioStreamRemovedMessage extends PeerMessage, LocalAudioStreamRemoved {
    type: MESSAGE_TYPES.LOCAL_AUDIO_REMOVED
}
export interface LocalVideoStreamAddedMessage extends PeerMessage, LocalVideoStreamAdded {
    type: MESSAGE_TYPES.LOCAL_VIDEO_ADDED
}
export interface LocalVideoStreamRemovedMessage extends PeerMessage, LocalVideoStreamRemoved {
    type: MESSAGE_TYPES.LOCAL_VIDEO_REMOVED
}
export interface RemoteAudioStreamAddedMessage extends PeerMessage, RemoteAudioStreamAdded {
    type: MESSAGE_TYPES.REMOTE_AUDIO_ADDED
}
export interface RemoteAudioStreamRemovedMessage extends PeerMessage, RemoteAudioStreamRemoved {
    type: MESSAGE_TYPES.REMOTE_AUDIO_REMOVED
}
export interface RemoteVideoStreamAddedMessage extends PeerMessage, RemoteVideoStreamAdded {
    type: MESSAGE_TYPES.REMOTE_VIDEO_ADDED
}
export interface RemoteVideoStreamRemovedMessage extends PeerMessage, RemoteVideoStreamRemoved {
    type: MESSAGE_TYPES.REMOTE_VIDEO_REMOVED
}