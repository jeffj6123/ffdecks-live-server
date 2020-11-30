import { Server as socketio, Socket } from "socket.io";

export class UserSocket {
    username: string;
    _socket: Socket;
    constructor(username: string, socket: Socket){
        this.username = username;
        this._socket = socket;
    }
    
    get socket(){
        return this._socket;
    }

    public listen(eventName: string, func: (data:any) => void) {
        this.socket.on(eventName, (data) => func(data));
    }
}