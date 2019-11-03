

export class ClientUser {
    private listeners: Record<string, (...args: any[]) => void > = {};

    constructor(public socket: SocketIOClient.Socket) {}

    sendMessage(event: string, message?: any){
        this.socket.emit(event, message);
    }

    public addListener(eventName: string, callback: (...args: any[]) => void): void {
        this.socket.on(eventName, callback);
        this.listeners[eventName] = callback;
    }

    public removeListener(eventName: string): void {
        const callback =  this.listeners[eventName];
        this.socket.removeListener(eventName, callback);
        delete this.listeners[eventName];
    }

}