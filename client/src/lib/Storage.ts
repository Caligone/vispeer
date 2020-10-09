import { Identity } from "./Crypto";

const enum OBJECT_STORES {
    IDENTITIES = 'identities',
}

export default class Storage {

    db: IDBDatabase;

    constructor(db: IDBDatabase) {
        this.db = db;
    }

    static async init(): Promise<Storage> {
        return new Promise((resolve, reject) => {
            const dbOpenRequest = indexedDB.open('vispeer', 1);
            dbOpenRequest.onerror = (e) => {
                reject((e.target as IDBOpenDBRequest).error);
            };
            dbOpenRequest.onsuccess = (e) => {
                resolve(new Storage((e.target as IDBOpenDBRequest).result));
            };
            dbOpenRequest.onupgradeneeded = (e) => {
                const storage = new Storage((e.target as IDBOpenDBRequest).result)
                storage.createStores();
                return resolve(storage);
            }
        });
    }

    public async createStores(): Promise<void> {
        this.db?.createObjectStore(OBJECT_STORES.IDENTITIES, { keyPath: 'name' });
    }

    fetchIdentity(name: string): Promise<Identity | null> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(OBJECT_STORES.IDENTITIES, 'readonly')
                .objectStore(OBJECT_STORES.IDENTITIES)
                .get(name);
            if (!request) return resolve(null)
            request.onerror = reject;
            request.onsuccess = (e) => resolve((e.target as IDBRequest).result);
        })
    }

    storeIdentity(identity: Identity): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.db?.transaction(OBJECT_STORES.IDENTITIES, 'readwrite')
                .objectStore(OBJECT_STORES.IDENTITIES)
                .add(identity);
                if (!request) return resolve()
                request.onerror = reject;
                request.onsuccess = () => resolve();
        });
    }

}