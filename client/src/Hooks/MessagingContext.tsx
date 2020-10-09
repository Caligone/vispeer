import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect } from 'preact/hooks';
import { useState } from 'preact/hooks';

export const enum MESSAGE_TYPES {
    INTERNAL,
    LOCAL,
    REMOTE,
}

export const enum ATTACHEMENT_TYPES {
    IMAGE,
}

export interface Attachement {
    identifier: string,
    type: ATTACHEMENT_TYPES,
    data: string,
}

export interface Message {
    type: MESSAGE_TYPES,
    author: string,
    content: string,
    date: number,
    attachements: Array<Attachement>,
}

type ContextType = {
    nickname: string,
    setNickname: (_: string) => void,
    roomName: string,
    setRoomName: (_: string) => void,
    notificationPermission: NotificationPermission,
    messages: Array<Message>,
    addMessage: (_: Message) => void,
    toggleNotificationPermission: () => void,
};

const defaultState: ContextType = {
    nickname: Math.random().toString(36).substring(7),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setNickname: () => {},
    roomName: Math.random().toString(36).substring(7),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setRoomName: () => {},
    messages: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    addMessage: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    notificationPermission: Notification.permission,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toggleNotificationPermission: () => {},
} 

const Context = createContext<ContextType>(defaultState);

async function checkNotificationPermissionFromBrowser(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    await Notification.requestPermission();
    return Notification.permission;
}

async function sendMessageNotification(message: Message): Promise<Notification | void> {
    if (message.type !== MESSAGE_TYPES.REMOTE) return;
    
    const notification = new Notification(message.content);
    return notification;
}

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const [nickname, setNickname] = useState(defaultState.nickname);
    const [roomName, setRoomName] = useState(defaultState.roomName);
    const [notificationPermission, setNotificationPermission] = useState(defaultState.notificationPermission);
    const [messages, setMessages] = useState(defaultState.messages);

    const addMessage = (message: Message) => {
        setMessages((messages) => [
            message,
            ...messages,
        ]);
    };

    // Send notification on new message
    useEffect(() => {
        if (notificationPermission !== 'granted') return;
        if (messages.length === 0) return;
        sendMessageNotification(messages[0]);
    }, [messages]);

    async function toggleNotificationPermission() {
        switch (notificationPermission) {
            case 'denied':
                // Can't do anything
            break;
            case 'granted':
                setNotificationPermission('default')
            break;
            case 'default':
                setNotificationPermission(
                    await checkNotificationPermissionFromBrowser(),
                );
            break;
        }
    }

    const context: ContextType = {
        nickname,
        setNickname,
        roomName,
        setRoomName,
        messages,
        addMessage,
        notificationPermission,
        toggleNotificationPermission,
    };

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);