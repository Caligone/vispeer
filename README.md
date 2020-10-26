# Vispeer - Privacy-first messaging app

The first goal of this project was personnal: to discover Typescript benefits and some WebRTC features

## Development

This project is based on a signaling server for establishing [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) and a web client that communicate with the connected peer.

### Server

Start the development server: `npm run dev`
Build the server: `npm run build`

### Client

Start the development client server: `npm run dev`
Build the client: `npm run build`


## To do
- [ ] Multiple peers conversation
- [ ] Multiple parallels conversations
- [ ] Persistant conversations
- [ ] Improve UI/UX

## Done
- [x] Connection between 2 peers
- [x] Text-based messaging p2p
- [x] p2p video and audio streams
- [x] Asymmetric encryption (based on [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) and over WebRTC native encryption)
