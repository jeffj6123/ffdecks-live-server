import * as express from "express";
import * as socketio from "socket.io";
import { CardHandler } from "./models/cardHandler";
import * as Http from "http";
import { MessagingHandler } from "./systems/messaging";
import { IUserSocket, UserSocket } from "./models/user";
import { GamesHandler } from "./models/game";

export class Server {
  gameHandler: GamesHandler;
  cardHandler: CardHandler;
  app: Express.Application;
  io: socketio.Server;
  messaging: MessagingHandler;
  users: IUserSocket[] = [];
  
  constructor(){
    this.cardHandler = new CardHandler();
  }

  initialize(): Promise<Http.Server>{
    return new Promise((resolve, reject) => {
      Promise.all([
        // this.cardHandler.initialize()
      ]).then(vals => {
        const app = express();
        app.set("port", process.env.PORT || 3000);
  
        
        let http = new Http.Server(app);
        let io = socketio(http);
  
        this.messaging = new MessagingHandler(io);
        this.gameHandler = new GamesHandler(io);

        //TODO move this?
        io.on('connection', (socket: socketio.Socket) => {
          console.log('a user connected');

          const user = new UserSocket(Math.random().toString(), socket);

          this.messaging.addSocket(user);
          this.gameHandler.addSocket(user);

          this.users.push(user);
          console.log(this.users.length)
          if(this.users.length % 2 === 0){
            this.gameHandler.newGame(this.users[this.users.length - 1], this.users[this.users.length - 2]);
          }          
        });
  
        resolve(http);
      })
    })
  }

}

let s = new Server();
s.initialize().then(expressServer => {
  expressServer.listen(3000, function(){
    console.log('listening on *:3000');
  });
})