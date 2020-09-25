import { h, createContext } from 'preact';
import { useContext, useReducer } from 'preact/hooks';

import { CONNECTION_STATUS } from '../@types/Connections';
import { Action, Dispatch, ProviderProps } from '../@types/Module';

const moduleName = 'CONNECTIONS_MODULE';

type State = {
    wsStatus: CONNECTION_STATUS,
    wrtcStatus: CONNECTION_STATUS,
    serverUrl: string,
};

const defaultState = {
    wsStatus: CONNECTION_STATUS.IDLE,
    wrtcStatus: CONNECTION_STATUS.IDLE,
    serverUrl: 'https://server.talk.calig.one',
};

const StateContext = createContext<State>(defaultState);
// eslint-disable-next-line @typescript-eslint/no-empty-function
const DispatchContext = createContext<Dispatch>(() => {});

const ACTION_NAME = {
    SET_WS_STATUS: `${moduleName}/SET_WS_STATUS`,
    SET_WRTC_STATUS: `${moduleName}/SET_WRTC_STATUS`,
    SET_SERVER_URL: `${moduleName}/SET_SERVER_URL`,
} as const;

interface SetWSStatusAction extends Action {
    type: typeof ACTION_NAME.SET_WS_STATUS,
    payload: { status: CONNECTION_STATUS },
}
interface SetWRTCStatusAction extends Action {
    type: typeof ACTION_NAME.SET_WRTC_STATUS,
    payload: { status: CONNECTION_STATUS },
}
interface SetServerURLAction extends Action {
    type: typeof ACTION_NAME.SET_WRTC_STATUS,
    payload: { serverUrl: string },
}

export const setWSStatus = (status: CONNECTION_STATUS): SetWSStatusAction => ({
    type: ACTION_NAME.SET_WS_STATUS,
    payload: { status },
});
export const setWRTCStatus = (status: CONNECTION_STATUS): SetWRTCStatusAction => ({
    type: ACTION_NAME.SET_WRTC_STATUS,
    payload: { status },
});
export const setServerUrl = (serverUrl: string): SetServerURLAction => ({
    type: ACTION_NAME.SET_SERVER_URL,
    payload: { serverUrl },
});

function Reducer(state: State = defaultState, action: Action): State {
    console.log('Connection action dispatched', action);
    switch (action.type) {
        case ACTION_NAME.SET_WS_STATUS: {
            return {
                ...state,
                wsStatus: (action as SetWSStatusAction).payload.status,
            };
        }
        case ACTION_NAME.SET_WRTC_STATUS: {
            return {
                ...state,
                wrtcStatus: (action as SetWRTCStatusAction).payload.status,
            };
        }
        case ACTION_NAME.SET_SERVER_URL: {
            return {
                ...state,
                serverUrl: (action as SetServerURLAction).payload.serverUrl,
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
        throw new Error(`useState must be used within a Provider (${moduleName})`);
    }
    return context;
}

function useDispatch(): Dispatch {
    const context = useContext(DispatchContext);
    if (!context) {
        throw new Error(`useDispatch must be used within a Provider (${moduleName})`);
    }
    return context;
}

export {
    Provider,
    useState,
    useDispatch
};
