/**
 * Create an event subscription/emitter stack
 */
export default class Event<T = unknown> {

    listeners: Set<(data: T) => void> = new Set();

    /**
     * Subscribe to the current event
     * 
     * @param listener The handler
     * @returns The unsubcribe method
     */
    public subscribe(listener: (data: T) => void): () => void {
        this.listeners.add(listener);
        return this.unsubscribe.bind(this, listener);
    }

    /**
     * Unsubscribe to the current event
     * 
     * @param listener The handler
     * @returns Boolean listener has been found
     */
    public unsubscribe(listener: (data: T) => void): boolean {
        return this.listeners.delete(listener);
    }

    /**
     * Dispatch the event
     * @param data 
     */
    public emit(data: T): void {
        this.listeners.forEach(listener => listener(data));
    }
}