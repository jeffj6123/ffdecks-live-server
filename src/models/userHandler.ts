import { Socket, Server } from "socket.io";
import { UserSocket } from "./user";

export class UserHandler{
    users: Record<string, UserSocket> = {};
    constructor(private server: Server){}

    addSocket(socket: Socket): Promise<UserSocket> {
        return new Promise((resolve, reject) => {
            socket.on('setname', (message: string ) => {
                if(this.users[message]){
                  reject(true);
                }else{
                  let u = new UserSocket(message, socket);
                  this.users[message] = u;
                resolve(u);
                }

                //TODO figure out when they arent authorized
              })
        })
    }

    addSocketTemp(socket: Socket, username: string) {
      socket.join(username);
    }

    getUser(username: string) {
      return this.users[username];
    }

    emitToUser(username: string, eventName: string, data: any) {
      this.server.to(username).emit(eventName, eventName,)
    }
}