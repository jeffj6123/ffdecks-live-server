import { IUUIDCard } from "../interfaces/ICard";
import uuid = require("uuid");
import { Server, Socket } from "socket.io";
import { addGridContainers, addPlayerContainers, getState, IBoardState } from './board/boardState';
import { GameBindingsHandler } from "./gameBindings";
import { insertDeckAndSetHand } from "./board/boardUtils";
import { data } from "./dummyData";
import { IBaseEvent } from "./event.interface";
import { UserSocket } from "./user";
import { UserHandler } from "./userHandler";

export interface ILoggingService{
    logAction: (data: any) => Promise<any>;
}

export interface IGameEvent extends IBaseEvent {
    username: string;
}

export const GAME_EVENT = "message"

export class GamesHandler{
    games: IBoardState[] = [];
    usersMap: Record<string, IBoardState> = {};

    private _server: Server;
    private _actions: GameBindingsHandler;

    constructor(server: Server, 
                actions: GameBindingsHandler,
                private userHandler: UserHandler){
        this._server = server;
        this._actions = actions;
    }

    addSocket(userSocket: UserSocket){
        userSocket.listen(GAME_EVENT, (event) =>  this.applyPlayerAction(userSocket.username, event) );
    }

    newGame(player: string, player2: string){
        const id = uuid();
        let gameState = getState(id);
        
        addPlayerContainers(player, gameState);
        insertDeckAndSetHand(gameState, data.cards, player);
        addGridContainers(player, gameState, 'forward', 8, 1);
        addGridContainers(player, gameState, 'backup', 5, 1);

        this.usersMap[player] = gameState;

        const player2Username = player2 || "test";
        addPlayerContainers(player2Username, gameState);
        insertDeckAndSetHand(gameState, data.cards.reverse(), player2Username);
        addGridContainers(player2Username, gameState, 'forward', 8, 1);
        addGridContainers(player2Username, gameState, 'backup', 5, 1);


        if(player2) {
            this.usersMap[player2] = gameState;
        }
        this.games.push(gameState);
        return gameState.gameId
    }

    applyPlayerAction(username: string, event: IGameEvent){
        console.log(username, event.op);
        const game = this.usersMap[username];
        if(!game) {
            return
        }
        // const player = game.getPlayer(userSocket.username);
        /*
        log message is meant to be human readable to distinctly display what action the user took
        user distint message is optionally used to send "private" state to the user performing the action
        group message is optionally used to send publicly visible state to all users within the match
        */
        const f = this._actions.resolveBinding(event.op);
        
        if(f){
            const {userDistinctMessageData, groupMessageData, logMessage } = f(game, event.data, username) ;

            if(userDistinctMessageData){
                this.userHandler.emitToUser(username, GAME_EVENT, userDistinctMessageData)
            }
            if(groupMessageData){
                // this.userHandler.emitToUser(username, GAME_EVENT, userDistinctMessageData)

                game.players.forEach(player => {
                    this.userHandler.emitToUser(player, GAME_EVENT, groupMessageData)
                })
            }
    
            // this._server.to(game.gameId).emit(GAME_EVENT, {type: "log", message: logMessage})

        }else{
            console.log("couldnt find binding") //TODO properly log this
        }

    }
}

/*
all events?

draw card from deck

//BOARD RELATED EVENTS
move card to board from hand
move card from hand to board
move card from board to breakzone
move card from breakzone to board
rotate card
move card within board
place top card of deck onto board

//deck related events
insert card into deck
search deck for card
view top card


*/