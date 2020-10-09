import Peer from 'simple-peer';
import {
    default as SignalingClient,
    Events as SignalingEvents,
} from '../SignalingClient'
import Event from '../Event';
import { CONNECTION_STATUS } from '../Connections';
import { PeerSignal } from '../SignalingClient/Events';
import {
    EncryptedTextMessageReceivedMessage,
    MESSAGE_TYPES,
    CryptoKeyMessage,
    PeerMessage,
    PeerSignalMessage,
    RemoteAudioStreamRemovedMessage,
    RemoteVideoStreamRemovedMessage,
} from './Messages';

import {
    ConnectionStatusChanged,
    TextMessageReceived,
    LocalAudioStreamAdded,
    LocalAudioStreamRemoved,
    LocalVideoStreamAdded,
    LocalVideoStreamRemoved,
    RemoteAudioStreamAdded,
    RemoteAudioStreamRemoved,
    RemoteVideoStreamAdded,
    RemoteVideoStreamRemoved,
} from './Events'
import { Message, MESSAGE_TYPES as MESSAGING_MESSAGE_TYPES } from '../../Hooks/MessagingContext';
import Crypto from '../Crypto';
import Storage from '../Storage';

export default class PeerClient {
    
    crypto?: Crypto;
    storage?: Storage;
    serverURL: string | null = null;
    serverClient: SignalingClient;
    peer: Peer.Instance | null = null;
    isInitiator = false;
    peerConnected = false;
    peerName: string | null = null;
    
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    public connectionStatusChangedEvent: Event<ConnectionStatusChanged>;
    public signalingConnectionStatusChangedEvent: Event<SignalingEvents.ConnectionStatusChanged>;
    public textMessageReceivedEvent: Event<TextMessageReceived>;

    public localAudioStreamAddedEvent: Event<LocalAudioStreamAdded>;
    public localAudioStreamRemovedEvent: Event<LocalAudioStreamRemoved>;
    public localVideoStreamAddedEvent: Event<LocalVideoStreamAdded>;
    public localVideoStreamRemovedEvent: Event<LocalVideoStreamRemoved>;
    public remoteAudioStreamAddedEvent: Event<RemoteAudioStreamAdded>;
    public remoteAudioStreamRemovedEvent: Event<RemoteAudioStreamRemoved>;
    public remoteVideoStreamAddedEvent: Event<RemoteVideoStreamAdded>;
    public remoteVideoStreamRemovedEvent: Event<RemoteVideoStreamRemoved>;

    constructor() {
        this.serverClient = new SignalingClient();
        const storagePromise = Storage.init().then((storage) => this.storage = storage);
        Crypto.init(storagePromise).then((crypto) => this.crypto = crypto);

        // Events
        this.connectionStatusChangedEvent = new Event<ConnectionStatusChanged>();
        this.signalingConnectionStatusChangedEvent = new Event<SignalingEvents.ConnectionStatusChanged>();
        this.textMessageReceivedEvent = new Event<TextMessageReceived>();
        this.localAudioStreamAddedEvent = new Event<LocalAudioStreamAdded>();
        this.localAudioStreamRemovedEvent = new Event<LocalAudioStreamRemoved>();
        this.localVideoStreamAddedEvent = new Event<LocalVideoStreamAdded>();
        this.localVideoStreamRemovedEvent = new Event<LocalVideoStreamRemoved>();
        this.remoteAudioStreamAddedEvent = new Event<RemoteAudioStreamAdded>();
        this.remoteAudioStreamRemovedEvent = new Event<RemoteAudioStreamRemoved>();
        this.remoteVideoStreamAddedEvent = new Event<RemoteVideoStreamAdded>();
        this.remoteVideoStreamRemovedEvent = new Event<RemoteVideoStreamRemoved>();

        // Listeners
        this.serverClient.connectionStatusChangedEvent.subscribe(
            this.onServerConnectionStatusChanged.bind(this),
        );
        this.serverClient.roomJoinedEvent.subscribe(
            this.onRoomJoined.bind(this),
        );
        this.serverClient.peerSignalEvent.subscribe((event: PeerSignal) => {
            this.peer?.signal(event.data)
        });
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

    public connect(serverURL: string): Promise<void> {
        this.serverURL = serverURL;
        return this.serverClient.connect(this.serverURL);
    }

    public async sendTextMessage(message: Message): Promise<void> {
        if (!this.crypto) {
            throw new Error('Crypto not initialized');
        }
        if (!this.peerName) {
            throw new Error('Peer identity not initialized');
        }
        const encryptedMessage = await this.crypto.encrypt(
            JSON.stringify(message),
            this.peerName,
        );
        this.peer?.send(JSON.stringify({
            type: MESSAGE_TYPES.TEXT_MESSAGE,
            message: encryptedMessage,
            author: message.author,
        } as EncryptedTextMessageReceivedMessage));
    }


    public async sendCryptoKey(): Promise<void> {
        if (!this.crypto) {
            throw new Error('Crypto not initialized');
        }
        this.peer?.send(JSON.stringify({
            type: MESSAGE_TYPES.CRYPTO_KEY,
            name: this.getNickname(),
            publicKey: await this.crypto.exportOwnPublicKey(),
        } as CryptoKeyMessage));
    }

    protected sendSignal(data: Peer.SignalData): void {
        const signalMessage: PeerSignalMessage = {
            type: MESSAGE_TYPES.SIGNAL,
            data,
        };
        this.peer?.send(JSON.stringify(signalMessage));
    }

    protected sendCloseAudioStream(): void {
        this.peer?.send(JSON.stringify({
            type: MESSAGE_TYPES.REMOTE_AUDIO_REMOVED,
            stream: null,
        } as RemoteAudioStreamRemovedMessage));
    }

    protected sendCloseVideoStream(): void {
        this.peer?.send(JSON.stringify({
            type: MESSAGE_TYPES.REMOTE_VIDEO_REMOVED,
            stream: null,
        } as RemoteVideoStreamRemovedMessage));
    }

    protected onServerConnectionStatusChanged(event: SignalingEvents.ConnectionStatusChanged): void {
        this.signalingConnectionStatusChangedEvent.emit(event);
    }

    onRoomJoined(event: SignalingEvents.RoomJoined): void {
        const ownAck = event.nickname === this.serverClient.getNickname();
        // Check if current user is the room owner
        if (ownAck) {
            this.isInitiator = event.isInitiator;
        } else {
            this.peerName = event.nickname;
        }

        // Hacky way to prevent the initiator to send signal before peer connection
        if (this.isInitiator && ownAck) return;
        
        // The initiator wait the second join to initiate the connection
        if (!ownAck && (this.peer || !this.isInitiator)) return;

        this.connectionStatusChangedEvent.emit({
            status: CONNECTION_STATUS.CONNECTING,
        });
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
            this.sendCryptoKey();
            this.peerConnected = true;
            this.connectionStatusChangedEvent.emit({
                status: CONNECTION_STATUS.CONNECTED,
            });
        });
        this.peer.on('close', () => {
            this.peer?.destroy();
            this.peer = null;
            this.peerConnected = false;
            if (this.serverURL) {
                this.serverClient.connect(this.serverURL);
            }
            this.connectionStatusChangedEvent.emit({
                status: CONNECTION_STATUS.DISCONNECTED,
            });
        });
        this.peer.on('error', (error) => {
            console.error(error);
            this.peer?.destroy(error);
            this.peer = null;
            this.peerConnected = false;
            this.connectionStatusChangedEvent.emit({
                status: CONNECTION_STATUS.DISCONNECTED,
            });
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
                this.remoteAudioStreamAddedEvent.emit({ stream });
            } else {
                this.remoteVideoStreamAddedEvent.emit({ stream });
            }
        });
        this.peer.on('data', (content) => {
            let peerMessage: PeerMessage | null = null;
            try {
                peerMessage = JSON.parse(content);
            } catch (e) {
                console.error(e);
            }
            if (!peerMessage) {
                throw new Error(`Can not parse peerMessage '${content}'`);
            }
            switch (peerMessage.type) {
                case MESSAGE_TYPES.TEXT_MESSAGE:
                    this.onMessage((peerMessage as EncryptedTextMessageReceivedMessage));
                    break;
                case MESSAGE_TYPES.CRYPTO_KEY:
                    this.crypto?.storePublicIdentity(
                        (peerMessage as CryptoKeyMessage).name,
                        (peerMessage as CryptoKeyMessage).publicKey,
                    );
                    break;
                case MESSAGE_TYPES.REMOTE_AUDIO_REMOVED:
                    // Faking peer.on('stream') on close
                    this.remoteAudioStreamRemovedEvent.emit({ stream: null });
                    break;
                case MESSAGE_TYPES.REMOTE_VIDEO_REMOVED:
                    // Faking peer.on('stream') on close
                    this.remoteVideoStreamRemovedEvent.emit({ stream: null });
                    break;
                case MESSAGE_TYPES.SIGNAL:
                    this.peer?.signal((peerMessage as PeerSignalMessage).data);
                    break;
            }
        });
    }

    protected async onMessage(encryptedMessage: EncryptedTextMessageReceivedMessage): Promise<void> {
        if (!this.crypto) {
            throw new Error('Crypto not initialized');
        }
        const messageContent = await this.crypto.decrypt(encryptedMessage.message);
        if (!messageContent) {
            this.textMessageReceivedEvent.emit({
                message: {
                    type: MESSAGING_MESSAGE_TYPES.REMOTE,
                    author: 'Unknown',
                    content: '<Encrypted message>',
                    date: Date.now(),
                    attachements: [],
                }
            });
            return;
        }
        this.textMessageReceivedEvent.emit({
            message: JSON.parse(messageContent)
        });
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
        this.localAudioStreamAddedEvent.emit({
            stream: this.localStream,
        });
    }

    async removeAudioStream(): Promise<void> {
        if (!this.localStream) return;
        this.localStream.getAudioTracks().forEach(this.removeTrackFromLocalStream, this);
        this.sendCloseAudioStream();
        this.localAudioStreamRemovedEvent.emit({
            stream: this.localStream,
        });
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
        this.localVideoStreamAddedEvent.emit({
            stream: this.localStream,
        });
    }

    async removeVideoStream(): Promise<void> {
        if (!this.localStream) return;
        this.localStream.getVideoTracks().forEach(this.removeTrackFromLocalStream, this);
        this.sendCloseVideoStream();
        this.localVideoStreamRemovedEvent.emit({
            stream: this.localStream,
        });
    }
}