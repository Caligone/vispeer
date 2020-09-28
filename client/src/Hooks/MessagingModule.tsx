import { h, createContext } from 'preact';
import { useContext, useReducer } from 'preact/hooks';

import { Message } from '../@types/Messaging';
import { Action, Dispatch } from '../@types/Module';

type State = {
    nickname: string,
    roomName: string,
    messages: Array<Message>,
};

type ProviderProps = {
    children: h.JSX.Element | Array<h.JSX.Element | null>
};

const defaultState = {
    nickname: Math.random().toString(36).substring(7),
    roomName: Math.random().toString(36).substring(7),
    messages: [],
};

const StateContext = createContext<State>(defaultState);
// eslint-disable-next-line @typescript-eslint/no-empty-function
const DispatchContext = createContext<Dispatch>(() => {});

const moduleName = 'MESSAGING_MODULE';
const ACTIONS = {
    SET_NICKNAME: `${moduleName}/SET_NICKNAME`,
    SET_ROOM_NAME: `${moduleName}/SET_ROOM_NAME`,
    ADD_MESSAGE: `${moduleName}/ADD_MESSAGE`,
} as const;

interface AddMessageAction extends Action {
    type: typeof ACTIONS.ADD_MESSAGE,
    payload: { message: Message },
}
interface SetNicknameAction extends Action {
    type: typeof ACTIONS.ADD_MESSAGE,
    payload: { nickname: string },
}
interface SetRoomNameAction extends Action {
    type: typeof ACTIONS.SET_ROOM_NAME,
    payload: { roomName: string },
}

export const addMessage = (message: Message): AddMessageAction => ({
    type: ACTIONS.ADD_MESSAGE,
    payload: { message },
});
export const setNickname = (nickname: string): SetNicknameAction => ({
    type: ACTIONS.SET_NICKNAME,
    payload: { nickname },
});
export const setRoomName = (roomName: string): SetRoomNameAction => ({
    type: ACTIONS.SET_ROOM_NAME,
    payload: { roomName },
});

function Reducer(state: State = defaultState, action: Action): State {
    switch (action.type) {
        case ACTIONS.ADD_MESSAGE: {
            return {
                ...state,
                messages: [
                    ...state.messages, {
                        ...(action as AddMessageAction).payload.message,
                        date: Date.now(),
                    },
                ].sort((a, b) => b.date - a.date),
            };
        }
        case ACTIONS.SET_NICKNAME: {
            return {
                ...state,
                nickname: (action as SetNicknameAction).payload.nickname,
            };
        }
        case ACTIONS.SET_ROOM_NAME: {
            return {
                ...state,
                roomName: (action as SetRoomNameAction).payload.roomName,
            };
        }
        default:
            return state;

    }

}

function Provider({ children }: ProviderProps): h.JSX.Element {
    const [state, dispatch] = useReducer(Reducer, defaultState);
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

function useState(): State {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error('useState must be used within a Provider');
    }
    return context;
}

function useDispatch(): Dispatch {
    const context = useContext(DispatchContext);
    if (!context) {
        throw new Error('useDispatch must be used within a Provider');
    }
    return context;
}

export {
    Provider,
    useState,
    useDispatch
};
