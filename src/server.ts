import * as express from "express";
import { Server as socketio, Socket } from "socket.io";
import * as Http from "http";
import { CardHandler } from "./models/cardHandler";
import { GamesHandler } from "./models/game";
import * as cors from 'cors';
import { Tedis, TedisPool } from "tedis";

import { GameBindingsHandler, getState, moveCard, rotateCard } from "./models/gameBindings";
import { LobbyhandlerSystem } from "./models/lobbyHandler";
import { UserHandler } from "./models/userHandler";

const bindingResolver = new GameBindingsHandler();
bindingResolver.addGameBinding("state", getState)
bindingResolver.addGameBinding("rotateCard", rotateCard)
bindingResolver.addGameBinding("moveCard", moveCard)

// auth
const tedis = new Tedis({
  port: 16667,
  host: "redis-16667.c1.us-central1-2.gce.cloud.redislabs.com",
  password: "pvkbLtJHlxs35pnUkKY6PyiMtcfa2vHa"
});

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
        this.lobbyHandler = new LobbyhandlerSystem(io, this.userHandler, this.gameHandler);

        //TODO move this?
        io.on('connection', async (socket: Socket) => {

          // const username = Math.random().toString();
          try {
            const userSocket = await this.userHandler.addSocket(socket);
            console.log(userSocket.username)
            this.gameHandler.addSocket(userSocket);
            this.lobbyHandler.addSocket(userSocket);
            
          }catch(e) {

          }
         
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