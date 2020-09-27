import Peer from 'simple-peer';
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
    protected socket: WebSocket | null = null;

    protected nickname = '';
    protected roomName = 'awesome-room';

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
            const url = new URL(this.url);
            url.searchParams.set('nickname', this.nickname);
            url.searchParams.set('roomName', this.roomName);
            this.socket = new WebSocket(url.toString());
            this.socket.onmessage = this.onMessage.bind(this);
            this.socket.onopen = () => {
                this.onConnect();
                resolve();
            };
            this.socket.onclose = this.onClose.bind(this);
        })
    }

    protected onMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case Messages.NAMES.PeerSignal:
                this.onPeerSignal(data.payload);
                break;
            case Messages.NAMES.RoomJoined:
                this.onRoomJoined(data.payload);
                break;
            case Messages.NAMES.RoomLeft:
                this.onRoomLeft(data.payload);
                break;
        }
    }

    protected send(eventName: string, payload: unknown): void {
        if (!this.socket) {
            throw new Error('Invalid socket');
        }
        this.socket.send(JSON.stringify({
            type: eventName,
            payload,
        }));
    }

    public sendSignal(signal: Peer.SignalData): void {
        this.send(Messages.NAMES.PeerSignal, signal);
    }

    public close(): void {
        this.socket?.close();
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

    protected onClose(): void {
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