import { arrayBufferToString, stringToArrayBuffer } from "./bufferHelper";

const enum KeyType {
    public = 'PUBLIC',
    private = 'PRIVATE'
}

export default class Identity {
    public name: string;

    protected publicKey: CryptoKey;
    protected privateKey?: CryptoKey;

    protected publicKeyPEMCache: string | null;
    protected privateKeyPEMCache: string | null;

    public constructor(name: string, publicKey: CryptoKey, privateKey?: CryptoKey) {
        this.name = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicKeyPEMCache = null;
        this.privateKeyPEMCache = null;
    }

    public static async generateIdentity(name: string): Promise<Identity> {
        const keyPair = await window.crypto.subtle.generateKey({
                name: 'RSA-OAEP',
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['encrypt', 'decrypt']
        );
        return new Identity(
            name,
            keyPair.publicKey,
            keyPair.privateKey,
        )
    }

    public static async buildIdentityFromPublicKey(name: string, rawPublicKey: JsonWebKey): Promise<Identity> {
        const publicKey = await window.crypto.subtle.importKey(
            'jwk',
            rawPublicKey, {
                name: 'RSA-OAEP',
                hash: { name: "SHA-256" },
            },
            true,
            ['encrypt'],
        );
        return new Identity(
            name,
            publicKey,
        );
    }

    protected static async exportCryptoKey(type: KeyType, key: CryptoKey): Promise<string> {
        const exported = await window.crypto.subtle.exportKey(
            type === KeyType.private ? 'pkcs8' : 'spki',
            key,
        );
        const exportedAsString = arrayBufferToString(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        return `-----BEGIN ${type} KEY-----\n${exportedAsBase64}\n-----END ${type} KEY-----`;
    }

    public async getPublicKey(): Promise<string> {
        if (!this.publicKeyPEMCache) {
            this.publicKeyPEMCache = await Identity.exportCryptoKey(
                KeyType.public,
                this.publicKey,
            );
        }
        return this.publicKeyPEMCache;
    }

    public hasPrivateKey(): boolean {
        return !!this.privateKey;
    }

    public async getPrivateKey(): Promise<string | null> {
        if (!this.privateKey) return null;
        if (!this.privateKeyPEMCache) {
            this.privateKeyPEMCache = await Identity.exportCryptoKey(
                KeyType.private,
                this.privateKey,
            );
        }
        return this.privateKeyPEMCache;
    }

    async encrypt(data: string): Promise<string | null> {
        let cipherBuffer = null;
        try {
            cipherBuffer = await window.crypto.subtle.encrypt({
                    name: 'RSA-OAEP',
                },
                this.publicKey,
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
            if (!this.privateKey) return null;
            cipherBuffer = await window.crypto.subtle.decrypt({
                    name: 'RSA-OAEP',
                },
                this.privateKey,
                stringToArrayBuffer(data),
            );
        } catch (e) {
            console.error(e);
            return null;
        }
        if (!cipherBuffer) return null;
        return arrayBufferToString(cipherBuffer);
    }

    async sharePublicKey(): Promise<JsonWebKey | null> {
        return window.crypto.subtle.exportKey('jwk', this.publicKey);
    }
}