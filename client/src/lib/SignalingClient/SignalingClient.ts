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

    protected socket: WebSocket | null = null;

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

    public connect(serverURL: string, name: string, roomName: string): Promise<void> {
        this.connectionStatusChangedEvent.emit({
            status: CONNECTION_STATUS.CONNECTING,
        });
        return new Promise((resolve) => {
            const url = new URL(serverURL);
            url.searchParams.set('name', name);
            url.searchParams.set('roomName', roomName);
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
                    name: (data as RoomJoinedMessage).name,
                    isInitiator: (data as RoomJoinedMessage).isInitiator,
                });
                break;
            case MESSAGE_TYPES.ROOM_LEFT:
                this.roomLeftEvent.emit({
                    roomName: (data as RoomLeftMessage).roomName,
                    name: (data as RoomLeftMessage).name,
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