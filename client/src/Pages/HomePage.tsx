import { h } from 'preact';

export default function HomePage(): h.JSX.Element {
    const randomRoomName = Math.random().toString(36).substring(7);
    return (
        <a href={`/join/${randomRoomName}`}>
            Join random room
        </a>
    );
}