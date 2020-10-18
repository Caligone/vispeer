import { h, createContext } from 'preact';
import { useContext as preactUseContext, useRef } from 'preact/hooks';
import {
    default as SignalingServerConnection,
} from '../lib/SignalingServerConnection';

type ContextType = {
    signalingServerConnection: SignalingServerConnection
};

const Context = createContext<ContextType>({} as ContextType);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const { current: signalingServerConnection } = useRef(new SignalingServerConnection());

    const context: ContextType = {
        signalingServerConnection,
    };

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);