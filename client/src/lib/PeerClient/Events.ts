import { Message } from '../../Hooks/MessagingContext';
/* eslint-disable @typescript-eslint/no-empty-interface */
import { CONNECTION_STATUS } from '../Connections';

export { ConnectionStatusChanged as SignalingConnectionStatusChanged } from '../SignalingClient/Events';

export interface ConnectionStatusChanged {
    status: CONNECTION_STATUS,
}

export interface TextMessageReceived {
    message: Message,
}

interface StreamChanged {
    stream: MediaStream | null
}
interface LocalStreamChanged extends StreamChanged {}
export interface LocalAudioStreamAdded extends LocalStreamChanged {}
export interface LocalAudioStreamRemoved extends LocalStreamChanged {}
export interface LocalVideoStreamAdded extends LocalStreamChanged {}
export interface LocalVideoStreamRemoved extends LocalStreamChanged {}

interface RemoteStreamChanged extends StreamChanged {}
export interface RemoteAudioStreamAdded extends RemoteStreamChanged {}
export interface RemoteAudioStreamRemoved extends RemoteStreamChanged {}
export interface RemoteVideoStreamAdded extends RemoteStreamChanged {}
export interface RemoteVideoStreamRemoved extends RemoteStreamChanged {}
