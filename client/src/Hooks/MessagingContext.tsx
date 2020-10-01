import { h, createContext } from 'preact';
import { useContext as preactUseContext, useReducer } from 'preact/hooks';
import { useState } from 'preact/hooks';
import { Message } from '../@types/Messaging';

type ContextType = {
    nickname: string,
    setNickname: (_: string) => void,
    roomName: string,
    setRoomName: (_: string) => void,
    messages: Array<Message>,
    addMessage: (_: Message) => void,
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
} 

const Context = createContext<ContextType>(defaultState);

const enum MessagesActionsTypes {
    ADD_MESSAGE = 'ADD_MESSAGE',
}
type ActionType = {
    type: MessagesActionsTypes,
    payload: {
        message: Message,
    },
};
type MessagesState = { messages: Array<Message> };
const MessagesReducer = (state: MessagesState, action: ActionType): MessagesState => {
    return {
        messages: [
            action.payload.message,
            ...state.messages,
        ],
    };
}

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const [nickname, setNickname] = useState(defaultState.nickname);
    const [roomName, setRoomName] = useState(defaultState.roomName);
    // Have to use useReducer because of the potentially fast update rate
    const [stateMessage, dispatchMessage] = useReducer(MessagesReducer, { messages: defaultState.messages })

    const addMessage = (message: Message) => {
        dispatchMessage({ 
            type: MessagesActionsTypes.ADD_MESSAGE,
            payload: { message },
         });
    };
    const context: ContextType = {
        nickname,
        setNickname,
        roomName,
        setRoomName,
        messages: stateMessage.messages,
        addMessage,
    };

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);