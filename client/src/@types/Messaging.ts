export const enum MESSAGE_TYPES {
    INTERNAL,
    LOCAL,
    REMOTE,
}

export interface Message {
    type: MESSAGE_TYPES,
    author: string,
    content: string,
    date: number,
}
