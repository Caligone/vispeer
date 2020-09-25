import SocketIO from 'socket.io';
import Express from 'express';
import { default as Http, Server as HttpServer } from 'http';
import * as Messages from './Messages';
import Peer from 'simple-peer';

interface User {
    socketId: string
    nickname: string
    isInitiator: boolean
}

export default class Server {

    port: number;
    app: HttpServer;
    server: HttpServer | null = null;
    io: SocketIO.Server | null = null;

    room: Map<string, User> = new Map();

    constructor(port: number) {
        this.port = port;
        this.app = Http.createServer({}, Express());
    }

    public start() {
        this.server = this.app.listen(this.port);
        this.io = SocketIO.listen(this.server);
        this.io.on('connection', (socket) => {
            this.setup(socket);
        })
    }

    protected setup(socket: SocketIO.Socket): void {
        socket.on(Messages.NAMES.RoomJoin, this.onRoomJoin.bind(this, socket));
        socket.on(Messages.NAMES.PeerSignal, this.onPeerSignal.bind(this, socket));
        socket.once('disconnect', this.onDisconnect.bind(this, socket));
    }

    /**
     * HANDLERS
     */
    protected onRoomJoin(socket: SocketIO.Socket, message: Messages.RoomJoin): void {
        let hasOwner: boolean = false;
        this.room.forEach(user => {
            if (user.isInitiator) {
                hasOwner = true;
            }
        });;
        const roomJoinedMessage: Messages.RoomJoined = {
            roomName: message.roomName,
            isInitiator: this.room.size === 0 || !hasOwner,
            nickname: message.nickname,
        };
        this.room.set(socket.id, {
            socketId: socket.id,
            isInitiator: roomJoinedMessage.isInitiator,
            nickname: roomJoinedMessage.nickname,
        });
        socket.broadcast.emit(Messages.NAMES.RoomJoined, roomJoinedMessage);
        this.room.forEach((user: User) => {
            // if (user.socketId === socket.id) return;
            socket.emit(Messages.NAMES.RoomJoined, {
                roomName: message.roomName,
                nickname: user.nickname,
                isInitiator: user.isInitiator,
            });
        });
        console.log(`User '${message.nickname}' join the room`);
    }

    protected onPeerSignal(socket: SocketIO.Socket, signal: Peer.SignalData): void {
        socket.broadcast.emit(Messages.NAMES.PeerSignal, signal);
    }

    protected onDisconnect(socket: SocketIO.Socket): void {
        const user = this.room.get(socket.id);
        if (!user) {
            console.log('User not connected left');
            return;
        }
        this.room.delete(socket.id);
        const roomLeftMessage: Messages.RoomLeft = {
            roomName: 'default room name',
            nickname: user.nickname,
        };
        socket.broadcast.emit(Messages.NAMES.RoomLeft, roomLeftMessage);
        console.log(`User '${user.nickname}' left the room`);
    }

}
