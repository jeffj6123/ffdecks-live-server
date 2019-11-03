import { User } from "./user";
import * as socketio from "socket.io";

export class UserHandler{
    users: User[] = [];
    constructor(){

    }

    addSocket(socket: socketio.Socket): Promise<User> {
        return new Promise((resolve, reject) => {
            socket.on('setname', (message: string ) => {
                const user = this.users.find(user => user.username === message);
                if(user){
                  user.switchSocket(socket);
                  reject(true);
                }else{
                  let u = new User(socket, message);
                  this.users.push(u);
                resolve(u);
                }

                //TODO figure out when they arent authorized
              })
        })

    }
}