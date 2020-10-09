import WebSocket from 'ws';
import { v4 as generateUuid } from 'uuid';
import Peer from 'simple-peer';
import { IncomingMessage } from 'http';
import {
    MESSAGE_TYPES,
    ServerMessage,
    PeerSignalMessage,
    RoomJoinedMessage,
    RoomLeftMessage,
} from './Messages';

type User = {
    identifier: string
    nickname: string
    socket: WebSocket
    isInitiator: boolean
}

type ConnectionParameters = {
    nickname: string
    roomName: string
}

const enum ERROR_CODES {
    INVALID_CONNECTION_PARAMETER = 1,
    ROOM_FULL = 2,
}

export default class Server {

    port: number;
    webSocketServer: WebSocket.Server;

    rooms: Map<string, Set<User>> = new Map();

    constructor(port: number) {
        this.port = port;
        this.webSocketServer = new WebSocket.Server({ port });
        this.webSocketServer.on('connection', this.onConnection.bind(this));
    }

    protected static getConnectionParameters(request: IncomingMessage): ConnectionParameters | null {
        if (!request.url) return null;
        const url = new URL(request.url, 'ws://localhost');
        const nickname = url.searchParams.get('nickname');
        const roomName = url.searchParams.get('roomName');
        if (!nickname || !roomName) {
            return null;
        }
        return {
            nickname,
            roomName,
        };
    }

    protected send(socket: WebSocket, data: ServerMessage): void {
        socket.send(JSON.stringify(data));
    }

    public addUserToRoom(roomName: string, user: User): boolean {
        if (!this.rooms.get(roomName)) {
            this.rooms.set(roomName, new Set<User>());
        }
        if (this.rooms.get(roomName)!.size > 1) {
            return false;
        }
        user.isInitiator = this.rooms.get(roomName)!.size === 0;
        this.rooms.get(roomName)!.add(user);
        return true;
    }

    protected onConnection(socket: WebSocket, request: IncomingMessage) {
        const connectionParameters = Server.getConnectionParameters(request);
        if (!connectionParameters) {
            socket.close(ERROR_CODES.INVALID_CONNECTION_PARAMETER, 'Invalid connection parameters');
            return;
        }
        const user: User = {
            identifier: generateUuid(),
            socket,
            nickname: connectionParameters.nickname,
            isInitiator: false,
        };
        if (!this.addUserToRoom(connectionParameters.roomName, user)) {
            user.socket.close(ERROR_CODES.ROOM_FULL, 'The room is already full');
            return;
        }
        socket.onmessage = this.onMessage.bind(this, user, connectionParameters.roomName)
        socket.onclose = this.onClose.bind(this, user, connectionParameters.roomName);
        this.rooms.get(connectionParameters.roomName)!.forEach((currentUser) => {;
            this.send(currentUser.socket, {
                type: MESSAGE_TYPES.ROOM_JOINED,
                roomName: connectionParameters.roomName,
                nickname: user.nickname,
                isInitiator: user.isInitiator
            } as RoomJoinedMessage);
            this.send(socket, {
                type: MESSAGE_TYPES.ROOM_JOINED,
                roomName: connectionParameters.roomName,
                nickname: currentUser.nickname,
                isInitiator: currentUser.isInitiator
            } as RoomJoinedMessage);
        });
    }



    protected onMessage(user: User, roomName: string, event: WebSocket.MessageEvent): void {
        const data = JSON.parse(event.data.toString());
        switch (data.type) {
            case MESSAGE_TYPES.PEER_SIGNAL:
                this.onPeerSignal(user, roomName, data.data);
                break;
        }
    }

    protected onPeerSignal(user: User, roomName: string, signal: Peer.SignalData): void {
        this.rooms.get(roomName)!.forEach((currentUser) => {
            if (currentUser.identifier === user.identifier) return;
            this.send(currentUser.socket, {
                type: MESSAGE_TYPES.PEER_SIGNAL,
                data: signal,
            } as PeerSignalMessage);
        });
    }

    protected onClose(user: User, roomName: string): void {
        this.rooms.get(roomName)?.delete(user);
        this.rooms.get(roomName)?.forEach((user) => {
            this.send(user.socket, {
                type: MESSAGE_TYPES.ROOM_LEFT,
                roomName,
                nickname: user.nickname,
            } as RoomLeftMessage);
        });
    }

}
