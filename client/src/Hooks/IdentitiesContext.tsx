import { h, createContext } from 'preact';
import { useContext as preactUseContext, useEffect, useRef, useState } from 'preact/hooks';
import LoadingScreen from '../Components/LoadingScreen';
import IdentitiesStorage from '../lib/IdentitiesStorage';
import Identity from '../lib/Identity';

type ContextType = {
    currentIdentity: Identity | null,
    identities: Array<Identity>,
    deleteIdentity: (_: string) => Promise<void>,
    setCurrentIdentity: (_: string) => void,
    addPeerIdentity: (_: Identity) => Promise<void>,
    generateIdentity: (_?: string) => Promise<void>,
};

const Context = createContext<ContextType>({} as ContextType);

export const Provider = ({ children }: h.JSX.ElementChildrenAttribute): h.JSX.Element => {
    const { current: identitiesStoragePromise } = useRef(IdentitiesStorage.init());
    const [ identitiesStorage, setIdentitiesStorage ] = useState<IdentitiesStorage | null>(null);
    const [ identities, setIdentities ] = useState<Array<Identity>>([]);
    const [ currentIdentity, setCurrentIdentity ] = useState<Identity | null>(null);
    useEffect(() => {
        (async () => {
            const newIdentitiesStorage = await identitiesStoragePromise;
            setIdentitiesStorage(newIdentitiesStorage);
        })();
    }, [identitiesStoragePromise]);
    if (identitiesStorage === null) {
        return (
            <LoadingScreen>
                <h1>Initializing identities storage...</h1>
            </LoadingScreen>
        );
    }

    const generateIdentity = async (nickname?: string): Promise<void> => {
        const identityName = nickname ?? Math.random().toString(36).substring(7);
        const newIdentity = await Identity.generateIdentity(identityName);
        await identitiesStorage?.saveIdentity(newIdentity);
        setCurrentIdentity(newIdentity);
    };

    useEffect(() => {
        identitiesStorage.getIdentities()
            .then(async (identitiesFetched) => {
                if (identitiesFetched) {
                    setIdentities(identitiesFetched);
                }
                const currentIdentityFound = (identitiesFetched ?? []).find((identity) => (
                    identity.hasPrivateKey()
                ));
                if (currentIdentityFound) {
                    return setCurrentIdentity(currentIdentityFound);
                }
                return null;
        });
        const unsubscribeToIdentityAdded = identitiesStorage.identityAdded.subscribe(async (identity: Identity) => {
            setIdentities((identities) => [...identities, identity]);
        });
        const unsubscribeToIdentityRemoved = identitiesStorage.identityRemoved.subscribe(async (name: string) => {
            setIdentities((identities) => identities.filter(identity => identity.name !== name));
        });
        return () => {
            unsubscribeToIdentityAdded();
            unsubscribeToIdentityRemoved();
        };
    }, [identitiesStorage.hash]);

    const context: ContextType = {
        identities,
        currentIdentity,
        setCurrentIdentity: (name: string): void => {
            const identityFound = identities.find(identity => identity.name === name);
            if (!identityFound) return;
            setCurrentIdentity(identityFound);
        },
        addPeerIdentity: identitiesStorage.saveIdentity.bind(identitiesStorage),
        generateIdentity: generateIdentity.bind(this),
        deleteIdentity: identitiesStorage.deleteIdentity.bind(identitiesStorage),
    };

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    );
}

export const { Consumer } = Context;

export default (): ContextType => preactUseContext(Context);