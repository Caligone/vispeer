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
    REMOTE_STREAM_CHANGED = 'remoteStreamChanged',
    LOCAL_STREAM_CHANGED = 'localStreamChanged',
}

export interface PeerConnectionStatusChangedEventData extends EventData {
    status: CONNECTION_STATUS,
}

export default class PeerClient {
    
    protected eventEmitter: EventEmitter;

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
        return this.serverClient.connect(serverURL);
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
            this.eventEmitter.dispatchEvent(
                EVENTS.REMOTE_STREAM_CHANGED,
                { stream } as Messages.RemoteStreamChangedEventData,
            );
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

    async addAudioStream(): Promise<void> {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_STREAM_CHANGED,
            { stream: this.localStream } as Messages.LocalStreamChangedEventData,
        );
        this.peer?.addStream(this.localStream);
    }

    async removeAudioStream(): Promise<void> {
        if (!this.localStream) return;
        this.peer?.removeStream(this.localStream);
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
        this.eventEmitter.dispatchEvent(
            EVENTS.LOCAL_STREAM_CHANGED,
            { stream: null } as Messages.LocalStreamChangedEventData,
        );
    }
}