import Storage from "./Storage";

export type Identity = {
    name: string,
    publicKey: CryptoKey,
    privateKey?: CryptoKey,
}

function stringToArrayBuffer(string: string): ArrayBuffer {
    const buffer = new ArrayBuffer(string.length);
    const bufferView = new Uint8Array(buffer);
    for (let i=0, strLen=string.length; i<strLen; i++) {
        bufferView[i] = string.charCodeAt(i);
    }
    return buffer;
}

function arrayBufferToString(str: ArrayBuffer): string {
    const byteArray = new Uint8Array(str);
    let byteString = '';
    for(let i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCodePoint(byteArray[i]);
    }
    return byteString;
}

export default class Crypto {

    identity: Identity;
    identitiesCache: Map<string, Identity>;
    storage: Storage;

    constructor(storage: Storage, identity: Identity) {
        this.identity = identity;
        this.storage = storage;
        this.identitiesCache = new Map<string, Identity>();
    }

    static async init(storagePromise: Promise<Storage>): Promise<Crypto> {
        const storage = await storagePromise;
        const identityFromStorage = await storage?.fetchIdentity('default');
        if (identityFromStorage) {
            return new Crypto(storage, identityFromStorage);
        }
        const newIdentity = await this.generateIdentity('default');
        if (!newIdentity) throw new Error('Can not generate new identity');
        await storage.storeIdentity(newIdentity);
        return new Crypto(storage, newIdentity);
    }

    static async generateIdentity(name: string): Promise<Identity | null> {
        try {
            const keyPair = await window.crypto.subtle.generateKey({
                    name: 'RSA-OAEP',
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
                true,
                ['encrypt', 'decrypt']
            );
            return {
                name,
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
            };
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    async getIdentity(name: string): Promise<Identity | null> {
        const identityFromCache = this.identitiesCache.get(name);
        if (identityFromCache) {
            return identityFromCache;
        }
        const identityFromStorage = await this.storage.fetchIdentity(name);
        if (identityFromStorage) {
            this.identitiesCache.set(name, identityFromStorage);
            return identityFromStorage;
        }
        return null;
    }

    async encrypt(data: string, name: string): Promise<string | null> {
        const identity = await this.getIdentity(name);
        if (!identity) {
            throw new Error(`Unknown identity '${name}'`);
        }
        let cipherBuffer = null;
        try {
            cipherBuffer = await window.crypto.subtle.encrypt({
                    name: 'RSA-OAEP',
                },
                identity.publicKey,
                stringToArrayBuffer(data),
            );
        } catch (e) {
            console.error(e);
            return null;
        }
        if (!cipherBuffer) return null;
        return arrayBufferToString(cipherBuffer);
    }

    async decrypt(data: string): Promise<string | null> {
        let cipherBuffer = null;
        try {
            if (!this.identity.privateKey) return null;
            cipherBuffer = await window.crypto.subtle.decrypt({
                    name: 'RSA-OAEP',
                },
                this.identity.privateKey,
                stringToArrayBuffer(data),
            );
        } catch (e) {
            console.error(e);
            return null;
        }
        if (!cipherBuffer) return null;
        return arrayBufferToString(cipherBuffer);
    }

    async storePublicIdentity(name: string, rawPublicKey: JsonWebKey): Promise<void> {
        const publicKey = await window.crypto.subtle.importKey(
            'jwk',
            rawPublicKey, {
                name: 'RSA-OAEP',
                hash: { name: "SHA-256" },
            },
            true,
            ['encrypt'],
        );
        this.identitiesCache.set(name, {
            name,
            publicKey,
        });
    }

    async exportOwnPublicKey(): Promise<JsonWebKey | null> {
        const ownIdentity: Identity | null = await this.getIdentity('default');
        if (!ownIdentity) return null;
        return window.crypto.subtle.exportKey('jwk', ownIdentity.publicKey);
    }

}