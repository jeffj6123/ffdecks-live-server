import * as socketio from "socket.io";
import { IUserSocket } from "../models/user";

export const MESSAGE_EVENT = "message";
export const DEFAULT_LOBBY = "general"

export interface IMessage {
    username: string;
    message: string;
    date?: Date;
    room: string;
}

// export class MessagingHandler{
    
//     _server: socketio.Server;

//     constructor(server: socketio.Server){
//         this._server = server;
//         console.log("initialized messaging")
//     }

//     sendMessage(message: IMessage): void {
//         console.log("sending message");
//         // console.log(this._server)
//         this._server.to(message.room).emit(MESSAGE_EVENT, message);
//     }

//     addSocket(userSocket: IUserSocket): void {
//         this.addRoom(DEFAULT_LOBBY, userSocket.socket);
//         userSocket.socket.on(MESSAGE_EVENT, this.sendMessage.bind(this) );
//     }

//     addRoom(room: string, socket: socketio.Socket): void {
//         socket.join(room);
//     }

//     leaveRoom(room: string, socket: socketio.Socket): void {
//         socket.leave(room);
//     }

// }

