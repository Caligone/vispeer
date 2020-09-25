import Peer from 'simple-peer';
import SocketIOClient from 'socket.io-client';
import EventEmitter, { EventData } from './EventEmitter';
import * as Messages from '../Messages';
import { CONNECTION_STATUS } from '../@types/Connections';

export enum EVENTS {
    ROOM_JOINED = 'roomJoined',
    ROOM_LEFT = 'roomLeft',
    PEER_SIGNAL = 'peerSignal',
    CONNECTION_STATUS_CHANGED = 'connectionStatusChanged',
}

interface WSConnectionStatusChangedEventData extends EventData {
    status: CONNECTION_STATUS,
}

export default class WSClient {

    protected eventEmitter: EventEmitter;

    protected url = '';
    protected socket: SocketIOClient.Socket | null = null;

    protected nickname = '';

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public setNickname(nickname: string): void{
        this.nickname = nickname;
    }
    
    public getNickname(): string {
        return this.nickname;
    }

    public addEventListener(eventName: EVENTS, listener: (data: EventData) => void): void {
        return this.eventEmitter.addEventListener(eventName as unknown as string, listener);
    }

    public removeEventListener(eventName: EVENTS, listener: (data: EventData) => void): boolean {
        return this.eventEmitter.removeEventListener(eventName as unknown as string, listener);
    }

    public connect(serverURL: string): Promise<void> {
        this.url = serverURL;
        const eventData: WSConnectionStatusChangedEventData = {
            eventName: EVENTS.CONNECTION_STATUS_CHANGED,
            status: CONNECTION_STATUS.CONNECTING,
        }
        this.eventEmitter.dispatchEvent(
            EVENTS.CONNECTION_STATUS_CHANGED,
            eventData,
        );
        return new Promise((resolve) => {
            this.socket = SocketIOClient(this.url);
            this.socket.once('connect', () => resolve());
            this.setup();
        })
    }

    protected setup(): void {
        if (!this.socket) {
            throw new Error('Invalid socket');
        }
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
        this.socket.on(Messages.NAMES.PeerSignal, this.onPeerSignal.bind(this));
        this.socket.on(Messages.NAMES.RoomJoined, this.onRoomJoined.bind(this));
        this.socket.on(Messages.NAMES.RoomLeft, this.onRoomLeft.bind(this));
    }

    protected send(eventName: string, data: unknown): void {
        if (!this.socket) {
            throw new Error('Invalid socket');
        }
        // console.debug(`Sending ${eventName}`, data);
        this.socket.emit(eventName, data);
    }

    public sendRoomJoin(roomName: string): void {
        const roomJoinMessage: Messages.RoomJoin = {
            roomName,
            nickname: this.nickname,
        };
        this.send(Messages.NAMES.RoomJoin, roomJoinMessage);
    }

    public sendSignal(signal: Peer.SignalData): void {
        this.send(Messages.NAMES.PeerSignal, signal);
    }

    /**
     * HANDLERS
     */

    protected onConnect(): void {
        const eventData: WSConnectionStatusChangedEventData = {
            eventName: EVENTS.CONNECTION_STATUS_CHANGED,
            status: CONNECTION_STATUS.CONNECTED,
        }
        this.eventEmitter.dispatchEvent(
            EVENTS.CONNECTION_STATUS_CHANGED,
            eventData,
        );
    }

    protected onDisconnect(): void {
        const eventData: WSConnectionStatusChangedEventData = {
            eventName: EVENTS.CONNECTION_STATUS_CHANGED,
            status: CONNECTION_STATUS.DISCONNECTED,
        }
        this.eventEmitter.dispatchEvent(
            EVENTS.CONNECTION_STATUS_CHANGED,
            eventData,
        );
    }

    protected onRoomJoined(incomingMessage: Messages.RoomJoined): void {
        const eventData: Messages.RoomJoinedEventData = {
            ...incomingMessage,
            eventName: EVENTS.ROOM_JOINED,
        };
        this.eventEmitter.dispatchEvent(EVENTS.ROOM_JOINED, eventData);
    }

    protected onRoomLeft(incomingMessage: Messages.RoomLeft): void {
        const eventData: Messages.RoomLeftEventData = {
            ...incomingMessage,
            eventName: EVENTS.ROOM_LEFT,
        };
        this.eventEmitter.dispatchEvent(EVENTS.ROOM_LEFT, eventData);
    }

    protected onPeerSignal(incomingMessage: Peer.SignalData): void {
        const eventData: Messages.PeerSignalEventData = {
            ...incomingMessage,
            eventName: EVENTS.PEER_SIGNAL,
        };
        this.eventEmitter.dispatchEvent(EVENTS.PEER_SIGNAL, eventData);
    }

}