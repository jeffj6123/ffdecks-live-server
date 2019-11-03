import * as socketIo from 'socket.io';

export interface IUser {
    username: string;
    sendMessage: (event: string, message: any) => void;
    //socket io callbacks are grossly annoying
    addListener: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string) => void;
    context: Record<string, any>;
}

export class User implements IUser {
    private listeners: Record<string, (...args: any[]) => void > = {};
    context: Record<string, any> = {};

    constructor(
        public socket: socketIo.Socket, 
        public username: string){}

    sendMessage(event: string, message: any){
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

    public switchSocket(socket: socketIo.Socket): void {
        console.log(this.socket.eventNames());
        console.log(socket.eventNames());

        for (let key in this.listeners) {
            let f = this.listeners[key];
            socket.on(key, f);
            this.socket.removeListener(key, f);
        }
        console.log(this.socket.eventNames());
        console.log(socket.eventNames());
        this.socket.disconnect();
        this.socket = socket;
        
    }
}

export class SocketBase {
    

}


export interface IUserSocket {
    socket: SocketIO.Socket;
    username: string;
}

export class UserSocket implements IUserSocket {
    username: string;
    _socket: SocketIO.Socket;
    constructor(username: string, socket: SocketIO.Socket){
        this.username = username;
        this._socket = socket;
    }
    
    get socket(){
        return this._socket;
    }

    
}