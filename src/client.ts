import * as socketioclient from "socket.io-client";
import { MESSAGE_EVENT, IMessage, DEFAULT_LOBBY } from "./systems/messaging";
import { GAME_EVENT } from "./models/game";

let users = 2

for(let i = 0; i < users; i++){
    const socket = socketioclient('http://localhost:3000')
    //let user = new ClientUser(socket);

    socket.on(MESSAGE_EVENT, (message: IMessage) => {
        console.log(message);
    });

    socket.on(GAME_EVENT, (message: any) => {
        console.log(message);
    })

    const message: IMessage = {
        username: i.toString(),
        message: "test",
        room: DEFAULT_LOBBY
    }

    socket.emit(MESSAGE_EVENT, message);
    // socket.emit(GAME_EVENT, {type:"DrawFromDeck"})

}