import * as socketIo from 'socket.io';

export interface IUser {
    username: string;
    sendMessage: (event: string, message: any) => void;
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
}

export interface IUserSocket {
    socket: SocketIO.Socket;
    username: string;
}

export class UserSocket implements IUserSocket {
    username: string;
    _socket: SocketIO.Socket;
    constructor(username: string, socket: any){
        this.username = username;
        this._socket = socket;
    }
    
    get socket(){
        return this._socket;
    }

    
}