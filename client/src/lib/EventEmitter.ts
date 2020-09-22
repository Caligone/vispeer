// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventData {
    eventName: string,
}

export default class EventEmitter {

    listeners: Map<string, Set<(data: EventData) => void>> = new Map();

    public addEventListener(eventName: string, listener: (data: EventData) => void): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)?.add(listener);
    }

    public removeEventListener(eventName: string, listener: (data: EventData) => void): boolean {
        return this.listeners.get(eventName)?.delete(listener) ?? false;
    }

    public dispatchEvent(eventName: string, data: EventData): void {
        this.listeners.get(eventName)?.forEach(listener => listener(data));
    }
}