export function stringToArrayBuffer(string: string): ArrayBuffer {
    const buffer = new ArrayBuffer(string.length);
    const bufferView = new Uint8Array(buffer);
    for (let i=0, strLen=string.length; i<strLen; i++) {
        bufferView[i] = string.charCodeAt(i);
    }
    return buffer;
}

export function arrayBufferToString(str: ArrayBuffer): string {
    const byteArray = new Uint8Array(str);
    let byteString = '';
    for(let i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCodePoint(byteArray[i]);
    }
    return byteString;
}