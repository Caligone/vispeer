import Peer from 'simple-peer';
import {
    default as ServerClient,
    EVENTS as SERVER_EVENTS,
 } from './ServerClient'
import * as Messages from '../Messages';
import EventEmitter, { EventData } from './EventEmitter';
import { CONNECTION_STATUS } from '../@types/Connections';

export enum EVENTS {
    ROOM_JOINED = 'roomJoined',
    ROOM_LEFT = 'roomLeft',
    CONNECTION_STATUS_CHANGED = 'peerConnectionStatusChanged',
    SERVER_CONNECTION_STATUS_CHANGED = 'serverConnectionStatusChanged',
    TEXT_MESSAGE = 'textMessage',
    REMOTE_AUDIO_ADDED = 'remoteAudioAdded',
    REMOTE_AUDIO_REMOVED = 'remoteAudioRemoved',
    REMOTE_VIDEO_ADDED = 'remoteVideoAdded',
    REMOTE_VIDEO_REMOVED = 'remoteVideoRemoved',
    LOCAL_AUDIO_ADDED = 'localAudioAdded',
    LOCAL_AUDIO_REMOVED = 'localAudioRemoved',
    LOCAL_VIDEO_ADDED = 'localVideoAdded',
    LOCAL_VIDEO_REMOVED = 'localVideoRemoved',
}

export interface PeerConnectionStatusChangedEventData extends EventData {
    status: CONNECTION_STATUS,
}

export default class PeerClient {
    
    protected eventEmitter: EventEmitter;

    serverURL: string | null = null;
    serverClient: ServerClient;
    peer: Peer.Instance | null = null;
    isInitiator = false;
    peerConnected = false;
    
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.serverClient = new ServerClient();
        this.serverClient.addEventListener(
            SERVER_EVENTS.CONNECTION_STATUS_CHANGED,
            this.onServerConnectionStatusChanged.bind(this),
        );
        this.serverClient.addEventListener(
            SERVER_EVENTS.ROOM_JOINED,
            this.onRoomJoined.bind(this),
        );
        this.serverClient.addEventListener(
            SERVER_EVENTS.ROOM_LEFT,
            this.onRoomLeft.bind(this),
        );
        this.serverClient.addEventListener(
            SERVER_EVENTS.PEER_SIGNAL,
            this.onPeerSignal.bind(this),
        );
    }

    public setNickname(nickname: string): void {
        this.serverClient.setNickname(nickname);
    }
    
    public getNickname(): string {
        return this.serverClient.getNickname();
    }

    public setRoomName(roomName: string): void {
        this.serverClient.setRoomName(roomName);
    }

    public addEventListener(eventName: EVENTS, listener: (data: EventData) => void): void {
        return this.eventEmitter.addEventListener(eventName as unknown as string, listener);
    }

    public removeEventListener(eventName: EVENTS, listener: (data: EventData) => void): boolean {
        return this.eventEmitter.removeEventListener(eventName as unknown as string, listener);
    }

    public connect(serverURL: string): Promise<void> {
        this.serverURL = serverURL;
        return this.serverClient.connect(this.serverURL);
    }

    public sendTextMessage(content: string): void {
        const textMessage: Messages.TextMessage = {
            type: Messages.PEER_MESSAGE_TYPE.TEXT_MESSAGE,
            author: this.serverClient.getNickname(),
            content,
            date: Date.now()
        };
        this.peer?.send(JSON.stringify(textMessage));
    }

    protected sendSignal(data: Peer.SignalData): void {
        const signalMessage: Messages.PeerSignal = {
            type: Messages.PEER_MESSAGE_TYPE.SIGNAL,
            data,
        };
        this.peer?.send(JSON.stringify(signalMessage));
    }

    protected sendCloseAudioStream(): void {
        const signalMessage: Messages.CloseAudioStream = {
            type: Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED,
        };
        this.peer?.send(JSON.stringify(signalMessage));
    }

    protected sendCloseVideoStream(): void {
        const signalMessage: Messages.CloseVideoStream = {
            type: Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED,
        };
        this.peer?.send(JSON.stringify(signalMessage));
    }

    protected onServerConnectionStatusChanged(eventData: EventData): void {
        this.eventEmitter.dispatchEvent(
            EVENTS.SERVER_CONNECTION_STATUS_CHANGED,
            eventData,
        );
    }

    onPeerSignal(signal: Messages.PeerSignalEventData): void {
        this.peer?.signal(signal);
    }

    onRoomJoined(rawMessage: EventData): void {
        const message = rawMessage as Messages.RoomJoinedEventData;
        const ownAck = message.nickname === this.serverClient.getNickname();
        this.eventEmitter.dispatchEvent(
            EVENTS.ROOM_JOINED,
            message,
        );
        // Check if current user is the room owner
        if (ownAck) {
            this.isInitiator = message.isInitiator;
        }

        // Hacky way to prevent the initiator to send signal before peer connection
        if (this.isInitiator && ownAck) return;

        // The initiator wait the second join to initiate the connection
        if (!ownAck && (this.peer || !this.isInitiator)) return;

        const eventData: PeerConnectionStatusChangedEventData = {
            eventName: EVENTS.CONNECTION_STATUS_CHANGED,
            status: CONNECTION_STATUS.CONNECTING,
        };
        this.eventEmitter.dispatchEvent(
            EVENTS.CONNECTION_STATUS_CHANGED,
            eventData,
        );
        this.peer = new Peer({
            initiator: this.isInitiator,
            objectMode: true,
        });
        this.peer.on('signal', (signal) => {
            if (this.peerConnected) {
                this.sendSignal(signal);
            } else {
                this.serverClient.sendSignal(signal);
            }
        });
        this.peer.on('connect', () => { 
            this.serverClient.close(); 
            this.peerConnected = true;
            const connectedEventData: PeerConnectionStatusChangedEventData = {
                eventName: EVENTS.CONNECTION_STATUS_CHANGED,
                status: CONNECTION_STATUS.CONNECTED,
            };
            this.eventEmitter.dispatchEvent(
                EVENTS.CONNECTION_STATUS_CHANGED,
                connectedEventData,
            );
        });
        this.peer.on('close', () => {
            this.peer?.destroy();
            this.peer = null;
            this.peerConnected = false;
            if (this.serverURL) {
                this.serverClient.connect(this.serverURL);
            }
            const disconnectedEventData: PeerConnectionStatusChangedEventData = {
                eventName: EVENTS.CONNECTION_STATUS_CHANGED,
                status: CONNECTION_STATUS.DISCONNECTED,
            };
            this.eventEmitter.dispatchEvent(
                EVENTS.CONNECTION_STATUS_CHANGED,
                disconnectedEventData,
            );
        });
        this.peer.on('error', (error) => {
            console.error(error);
            this.peer?.destroy(error);
            this.peer = null;
            this.peerConnected = false;
            const disconnectedEventData: PeerConnectionStatusChangedEventData = {
                eventName: EVENTS.CONNECTION_STATUS_CHANGED,
                status: CONNECTION_STATUS.DISCONNECTED,
            };
            this.eventEmitter.dispatchEvent(
                EVENTS.CONNECTION_STATUS_CHANGED,
                disconnectedEventData,
            );
        });
        this.peer.on('stream', (stream) => {
            this.remoteStream = stream;
        });
        this.peer.on('track', (track: MediaStreamTrack, stream: MediaStream) => {
            if (!this.remoteStream) {
                this.remoteStream = stream;
            }
            this.remoteStream.addTrack(track);
            if (track.kind === 'audio') {
                this.eventEmitter.dispatchEvent(
                    EVENTS.REMOTE_AUDIO_ADDED,
                    {
                        eventName: Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_ADDED,
                        stream: this.remoteStream,
                    } as Messages.RemoteStreamChangedEventData,
                );
            } else {
                this.eventEmitter.dispatchEvent(
                    EVENTS.REMOTE_VIDEO_ADDED,
                    {
                        eventName: Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_ADDED,
                        stream: this.remoteStream,
                    } as Messages.RemoteStreamChangedEventData,
                );
            }
        });
        this.peer.on('data', (content) => {
            let message = null;
            try {
                message = JSON.parse(content);
            } catch (e) {
                throw new Error(`Can not parse message '${content}'`);
            }
            switch (message.type) {
                case Messages.PEER_MESSAGE_TYPE.TEXT_MESSAGE:
                    this.eventEmitter.dispatchEvent(
                        EVENTS.TEXT_MESSAGE,
                        message,
                    );
                    break;
                case Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED:
                    // Faking peer.on('stream') on close
                    this.eventEmitter.dispatchEvent(
                        EVENTS.REMOTE_AUDIO_REMOVED,
                        {
                            ...message,
                            eventName: Messages.PEER_MESSAGE_TYPE.REMOTE_AUDIO_REMOVED,
                            stream: null,
                        },
                    );
                    break;
                case Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED:
                    // Faking peer.on('stream') on close
                    this.eventEmitter.dispatchEvent(
                        EVENTS.REMOTE_VIDEO_REMOVED,
                        {
                            ...message,
                            eventName: Messages.PEER_MESSAGE_TYPE.REMOTE_VIDEO_REMOVED,
                            stream: null,
                        },
                    );
                    break;
                case Messages.PEER_MESSAGE_TYPE.SIGNAL:
                    this.peer?.signal(message.data);
                    break;
            }
        });
    }

    onRoomLeft(rawMessage: EventData): void {
        const message = rawMessage as Messages.RoomLeftEventData;
        this.eventEmitter.dispatchEvent(
            EVENTS.ROOM_LEFT,
            message,
        );
    }

    protected async addStream(): Promise<void> {
        this.localStream = new MediaStream();
        this.peer?.addStream(this.localStream);
    }

    protected async removeStream(): Promise<void> {
        if (!this.localStream) return;
        this.peer?.removeStream(this.localStream);
        this.localStream = null;
    }

    async addTrackToLocalStream(track: MediaStreamTrack): Promise<void> {
        if (!this.localStream) return;
        this.localStream.addTrack(track);
        this.peer?.addTrack(track, this.localStream);
    }

    async removeTrackFromLocalStream(track: MediaStreamTrack): Promise<void> {
        if (!this.localStream) return;
        this.peer?.removeTrack(track, this.localStream);
        track.stop();
        this.localStream.removeTrack(track);
        if (this.localStream.getTracks().length === 0) {
            this.removeStream();
        }
    }

    async addAudioStream(): Promise<void> {
        const alreadyHasVideoTracks = (this.localStream && this.localStream.getVideoTracks().length > 0) ?? false;
        if (!alreadyHasVideoTracks) {
            this.addStream();
        }
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: alreadyHasVideoTracks,
            audio: true,
        });
        newStream.getAudioTracks().forEach(this.addTrackToLocalStream, this);
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_AUDIO_ADDED,
            {
                eventName: Messages.PEER_MESSAGE_TYPE.LOCAL_AUDIO_ADDED,
                stream: this.localStream,
            } as Messages.LocalStreamChangedEventData,
        );
    }

    async removeAudioStream(): Promise<void> {
        if (!this.localStream) return;
        this.localStream.getAudioTracks().forEach(this.removeTrackFromLocalStream, this);
        this.sendCloseAudioStream();
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_AUDIO_REMOVED,
            {
                eventName: Messages.PEER_MESSAGE_TYPE.LOCAL_AUDIO_REMOVED,
                stream: this.localStream,
            } as Messages.LocalStreamChangedEventData,
        );
    }
    async addVideoStream(): Promise<void> {
        const alreadyHasAudioTracks = (this.localStream && this.localStream.getAudioTracks().length > 0) ?? false;
        if (!alreadyHasAudioTracks) {
            this.addStream();
        }
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: (this.localStream && this.localStream.getAudioTracks().length > 0) ?? false,
        });
        newStream.getVideoTracks().forEach(this.addTrackToLocalStream, this);
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_VIDEO_ADDED,
            { 
                eventName: Messages.PEER_MESSAGE_TYPE.LOCAL_VIDEO_ADDED,
                stream: this.localStream,
            } as Messages.LocalStreamChangedEventData,
        );
    }

    async removeVideoStream(): Promise<void> {
        if (!this.localStream) return;
        this.localStream.getVideoTracks().forEach(this.removeTrackFromLocalStream, this);
        this.sendCloseVideoStream();
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_VIDEO_REMOVED,
            { 
                eventName: Messages.PEER_MESSAGE_TYPE.LOCAL_VIDEO_REMOVED,
                stream: this.localStream,
            } as Messages.LocalStreamChangedEventData,
        );
    }
}