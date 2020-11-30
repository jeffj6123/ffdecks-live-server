import * as express from "express";
import { Server as socketio, Socket } from "socket.io";
import * as Http from "http";
import { CardHandler } from "./models/cardHandler";
import { UserSocket } from "./models/user";
import { GamesHandler } from "./models/game";
import * as cors from 'cors';

import { GameBindingsHandler, moveCard, rotateCard } from "./models/gameBindings";
import { Lobbyhandler, LobbyhandlerSystem } from "./models/lobbyHandler";
import { UserHandler } from "./models/userHandler";

const bindingResolver = new GameBindingsHandler();
bindingResolver.addGameBinding("rotateCard", rotateCard)
bindingResolver.addGameBinding("moveCard", moveCard)

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: "*",
  preflightContinue: false,
};

export class Server {
  gameHandler: GamesHandler;
  cardHandler: CardHandler;
  lobbyHandler: LobbyhandlerSystem;
  userHandler: UserHandler;
  app: Express.Application;
  io: socketio;
  
  constructor(){
    this.cardHandler = new CardHandler();
  }

  async initialize(): Promise<Http.Server>{
      //initilize all dependencies
      await Promise.all([
        // this.cardHandler.initialize()
      ])
        const app = express();
        app.set("port", process.env.PORT || 3000);
        app.use(cors(options));
        app.options('*', cors(options));
        
        let http = new Http.Server(app);
        //ts-ignore
        let io = new socketio(http, {
          cors: {
            origin: '*',
          }
        });
        
        this.userHandler = new UserHandler(io);
        this.gameHandler = new GamesHandler(io, bindingResolver, this.userHandler);
        this.lobbyHandler = new LobbyhandlerSystem(io, this.userHandler);

        //TODO move this?
        io.on('connection', (socket: Socket) => {

          const user = new UserSocket(Math.random().toString(), socket);

          this.gameHandler.addSocket(user);
          this.lobbyHandler.addSocket(user);
          
          // TODO remove. this is temp.
          // if(this.users.length % 2 === 0){
          //   this.gameHandler.newGame(this.users[this.users.length - 1], this.users[this.users.length - 2]);
          // }          
        });
  
        return http;
    }
}

let f = async () => {
  let s = new Server();
  let expressServer = await s.initialize()
  expressServer.listen(3000, function(){
    console.log('listening on *:3000');
  });
}

f();