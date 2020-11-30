import { Socket, Server } from "socket.io";
import { UserSocket } from "./user";

export class UserHandler{
    users: Record<string, UserSocket> = {};
    constructor(private server: Server){}

    addSocket(socket: Socket): Promise<UserSocket> {
        return new Promise((resolve, reject) => {
            socket.on('setname', (message: string ) => {
                // if(this.users[message]){
                //   reject(true);
                // }else{
                  let u = new UserSocket(message, socket);
                  socket.join(message);
                  this.users[message] = u;
                // }
                socket.emit("ready");
                resolve(u);

                //TODO figure out when they arent authorized
              })
            socket.emit('setname');
        })
    }

    addSocketTemp(socket: Socket, username: string) {
      socket.join(username);
      this.users[username] = new UserSocket(username, socket);
    }

    getUser(username: string) {
      return this.users[username];
    }

    emitToUser(username: string, eventName: string, data: any) {
      console.log(username, eventName, data)
      this.server.to(username).emit(eventName, data)
    }
}