import Event from "./Event";
import Identity from "./Identity";

type StoredIdentity = {
    name: string;
    publicKey: CryptoKey;
    privateKey: CryptoKey | undefined;
}

export default class IdentitiesStorage {

    protected static OBJECT_STORE_NAME = 'IDENTITIES';
    protected static VERSION = 1;

    protected db: IDBDatabase;
    public hash: string;

    public identityAdded: Event<Identity>;
    public identityRemoved: Event<string>;

    protected constructor(db: IDBDatabase) {
        this.db = db;
        this.identityAdded = new Event<Identity>();
        this.identityRemoved = new Event<string>();
        this.hash = Math.random().toString(36).substring(7);
    }

    public static async init(): Promise<IdentitiesStorage> {
        return new Promise((resolve, reject) => {
            const dbOpenRequest = indexedDB.open('vispeer', 1);
            dbOpenRequest.onerror = (e) => {
                reject((e.target as IDBOpenDBRequest).error);
            };
            dbOpenRequest.onsuccess = (e) => {
                resolve(new IdentitiesStorage((e.target as IDBOpenDBRequest).result));
            };
            dbOpenRequest.onupgradeneeded = async (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                await IdentitiesStorage.upgradeDatabase(db, e.oldVersion, e.newVersion)
                return resolve(new IdentitiesStorage(db));
            }
        });
    }

    protected async getIdentity(name: string): Promise<Identity | null> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(IdentitiesStorage.OBJECT_STORE_NAME, 'readonly')
                .objectStore(IdentitiesStorage.OBJECT_STORE_NAME)
                .get(name);
            if (!request) return resolve(null)
            request.onerror = reject;
            request.onsuccess = (e) => {
                const { result }: { result: StoredIdentity } = (e.target as IDBRequest);
                resolve(new Identity(
                    result.name,
                    result.publicKey,
                    result.privateKey,
                ));
            };
        })
    }

    public async getIdentities(): Promise<Array<Identity> | null> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(IdentitiesStorage.OBJECT_STORE_NAME, 'readonly')
                .objectStore(IdentitiesStorage.OBJECT_STORE_NAME)
                .getAll();
            if (!request) return resolve(null)
            request.onerror = reject;
            request.onsuccess = (e) => {
                const { result: results } = (e.target as IDBRequest);
                resolve(results.map((result: StoredIdentity) => new Identity(
                    result.name,
                    result.publicKey,
                    result.privateKey,
                )));
            };
        })
    }

    public async saveIdentity(identity: Identity): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(IdentitiesStorage.OBJECT_STORE_NAME, 'readwrite')
                .objectStore(IdentitiesStorage.OBJECT_STORE_NAME)
                .add(identity);
                if (!request) return resolve()
                request.onerror = (e) => {
                    if ((e.target as IDBRequest).error?.name === 'ConstraintError') {
                        return resolve();
                    }
                    return reject();
                };
                request.onsuccess = () => {
                    resolve();
                    this.identityAdded.emit(identity);
                };
        });
    }

    public async deleteIdentity(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(IdentitiesStorage.OBJECT_STORE_NAME, 'readwrite')
                .objectStore(IdentitiesStorage.OBJECT_STORE_NAME)
                .delete(name);
                if (!request) return resolve()
                request.onerror = reject;
                request.onsuccess = () => {
                    resolve();
                    this.identityRemoved.emit(name);
                };
        });
    }

    protected static async upgradeDatabase(db: IDBDatabase, oldVersion: number, newVersion: number | null): Promise<void> {
        console.log(`Local database will migrate from v${oldVersion} to v${newVersion}`);
        if (oldVersion === 0) {
            db.createObjectStore(IdentitiesStorage.OBJECT_STORE_NAME, { keyPath: 'name' });
        }
        console.log('Local database migration done');
    }
}