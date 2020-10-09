import Peer from 'simple-peer';
import Event from '../Event';
import {
    RoomJoined,
    PeerSignal,
    RoomLeft,
    ConnectionStatusChanged,
} from './Events';

import { CONNECTION_STATUS } from '../Connections';
import { MESSAGE_TYPES, PeerSignalMessage, RoomJoinedMessage, RoomJoinMessage, RoomLeftMessage } from './Messages';

export default class SignalingClient {

    protected url = '';
    protected socket: WebSocket | null = null;

    protected nickname = '';
    protected roomName = '';

    // Events
    public connectionStatusChangedEvent: Event<ConnectionStatusChanged>;
    public roomJoinedEvent: Event<RoomJoined>;
    public roomLeftEvent: Event<RoomLeft>;
    public peerSignalEvent: Event<PeerSignal>;

    constructor() {
        this.connectionStatusChangedEvent = new Event<ConnectionStatusChanged>();
        this.roomJoinedEvent = new Event<RoomJoined>();
        this.roomLeftEvent = new Event<RoomLeft>();
        this.roomLeftEvent = new Event<RoomLeft>();
        this.peerSignalEvent = new Event<PeerSignal>();
    }

    public setNickname(nickname: string): void{
        this.nickname = nickname;
    }

    public setRoomName(roomName: string): void{
        this.roomName = roomName;
    }
    
    public getNickname(): string {
        return this.nickname;
    }

    public connect(serverURL: string): Promise<void> {
        this.url = serverURL;
        this.connectionStatusChangedEvent.emit({
            status: CONNECTION_STATUS.CONNECTING,
        });
        return new Promise((resolve) => {
            const url = new URL(this.url);
            url.searchParams.set('nickname', this.nickname);
            url.searchParams.set('roomName', this.roomName);
            this.socket = new WebSocket(url.toString());
            this.socket.onmessage = this.onMessage.bind(this);
            this.socket.onopen = () => {
                this.connectionStatusChangedEvent.emit({
                    status: CONNECTION_STATUS.CONNECTED,
                });
                resolve();
            };
            this.socket.onclose = () => {
                this.connectionStatusChangedEvent.emit({
                    status: CONNECTION_STATUS.DISCONNECTED,
                });
            };
        })
    }

    protected onMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case MESSAGE_TYPES.PEER_SIGNAL:
                this.peerSignalEvent.emit({
                    data: (data as PeerSignalMessage).data,
                });
                break;
            case MESSAGE_TYPES.ROOM_JOINED:
                this.roomJoinedEvent.emit({
                    roomName: (data as RoomJoinedMessage).roomName,
                    nickname: (data as RoomJoinedMessage).nickname,
                    isInitiator: (data as RoomJoinedMessage).isInitiator,
                });
                break;
            case MESSAGE_TYPES.ROOM_LEFT:
                this.roomLeftEvent.emit({
                    roomName: (data as RoomLeftMessage).roomName,
                    nickname: (data as RoomLeftMessage).nickname,
                });
                break;
        }
    }

    protected send(data:
          RoomJoinMessage
        | RoomJoinedMessage
        | RoomLeftMessage
        | PeerSignalMessage
    ): void {
        if (!this.socket) {
            throw new Error('Invalid socket');
        }
        this.socket.send(JSON.stringify(data));
    }

    public sendSignal(signal: Peer.SignalData): void {
        this.send({
            type: MESSAGE_TYPES.PEER_SIGNAL,
            data: signal
        });
    }

    public close(): void {
        this.socket?.close();
    }

}