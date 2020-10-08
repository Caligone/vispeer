export const enum MESSAGE_TYPES {
    INTERNAL,
    LOCAL,
    REMOTE,
}

export const enum ATTACHEMENT_TYPES {
    IMAGE,
}

export interface Attachement {
    identifier: string,
    type: ATTACHEMENT_TYPES,
    data: string,
}

export interface Message {
    type: MESSAGE_TYPES,
    author: string,
    content: string,
    date: number,
    attachements: Array<Attachement>,
}
