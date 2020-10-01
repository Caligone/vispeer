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
}

export interface PeerConnectionStatusChangedEventData extends EventData {
    status: CONNECTION_STATUS,
}
export interface RoomJoinedEventData extends EventData, Messages.RoomJoined {}
export interface RoomLeftEventData extends EventData, Messages.RoomLeft {}
export interface PeerSignalEventData extends EventData, Peer.SignalData {}

export default class PeerClient {
    
    protected eventEmitter: EventEmitter;

    serverClient: ServerClient;
    peer: Peer.Instance | null = null;
    isInitiator = false;
    peerConnected = false;

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
            author: this.serverClient.getNickname(),
            content,
            date: Date.now()
        };
        this.peer?.send(JSON.stringify(textMessage));
    }

    protected onServerConnectionStatusChanged(eventData: EventData): void {
        this.eventEmitter.dispatchEvent(
            EVENTS.SERVER_CONNECTION_STATUS_CHANGED,
            eventData,
        );
    }

    onPeerSignal(signal: PeerSignalEventData): void {
        this.peer?.signal(signal);
    }

    onRoomJoined(rawMessage: EventData): void {
        const message = rawMessage as RoomJoinedEventData;
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
            this.serverClient.sendSignal(signal);
        });
        this.peer.on('connect', () => { 
            this.serverClient.close(); 
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
            const disconnectedEventData: PeerConnectionStatusChangedEventData = {
                eventName: EVENTS.CONNECTION_STATUS_CHANGED,
                status: CONNECTION_STATUS.DISCONNECTED,
            };
            this.eventEmitter.dispatchEvent(
                EVENTS.CONNECTION_STATUS_CHANGED,
                disconnectedEventData,
            );
        });
        this.peer.on('data', (content) => {
            try {
                this.eventEmitter.dispatchEvent(
                    EVENTS.TEXT_MESSAGE,
                    JSON.parse(content),
                );
            } catch (e) {
                throw new Error(`Can not parse message '${content}'`);
            }
        });
    }

    onRoomLeft(rawMessage: EventData): void {
        const message = rawMessage as RoomLeftEventData;
        this.eventEmitter.dispatchEvent(
            EVENTS.ROOM_LEFT,
            message,
        );
    }
}