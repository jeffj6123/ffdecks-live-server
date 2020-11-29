import { IUUIDCard } from "../interfaces/ICard";
import { IUserSocket } from "./user";
import uuid = require("uuid");
import * as socketio from "socket.io";
import { addGridContainers, addPlayerContainers, getState, IBoardState } from './board/boardState';
import { GameBindingsHandler } from "./gameBindings";
import { insertDeckAndSetHand } from "./board/boardUtils";
import { data } from "./dummyData";
export class Deck {
    _cards: IUUIDCard[] = [];

    constructor(cards: IUUIDCard[]){
        this._cards = cards;
    }

    public get length(): number {
        return this._cards.length;
    }

    addCard(card: IUUIDCard, index: number = null): void{
        if(Number){
            this._cards.push(card);
        }else{
            this._cards.splice(index, 0, card);
        }
    }

    drawCard(): IUUIDCard {
        return this._cards.shift();
    }

    peakTopCards(count: number = 1){
        return this._cards.slice(0, count);
    }

    shuffle(): void {
        //Fisher-Yates all the way
        let currentIndex = this.length, temporaryValue;
        
        // While there remain elements to shuffle
        while (0 !== currentIndex) {
        
            // Pick a remaining element...
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            // And swap it with the current element.
            const temporaryValue = this._cards[currentIndex];
            this._cards[currentIndex] = this._cards[randomIndex];
            this._cards[randomIndex] = temporaryValue;
        }
    }
}

export class CardContainer {
    _cards: IUUIDCard[]
    constructor(cards: IUUIDCard[]){
        this._cards = cards;
    }

    get length(){
        return this._cards.length;
    }

    insert(card: IUUIDCard, index: number = null): void{
        if(Number){
            this._cards.push(card);
        }else{
            this._cards.splice(index, 0, card);
        }
    }

    removeByUUID(uuid: number): IUUIDCard {
        const index = this._cards.findIndex(card => card.uuid === uuid);
        return this._cards.splice(index, 1)[0];
    }
}

export interface ILoggingService{
    logAction: (data: any) => Promise<any>;
}


// export class Game {
//     id: string;
//     players: IPlayerData[];

//     boardState: ICardBoardState[];

//     _onGameFinished: Promise<any>;

//     constructor(id: string, players: {deck: Deck, username: string}[]){
//         this.id = id;
//         this.players = players.map(data => { return {
//             username: data.username,
//             deck: data.deck,
//             breakZone: new CardContainer([]),
//             hand: new CardContainer([])}
//             })

//         this._onGameFinished = new Promise( (resolve, reject) => {

//         })

//     }

//     drawCard(player: IPlayerData): IDrawCard {
//         const card = player.deck.drawCard();
//         const deckLength = player.deck.length;
//         this.addCardToHand(player, card);
//         const handSize = player.hand.length;
//         return {
//             deckLength,
//             card,
//             handSize
//         }
//     }

//     addCardToHand(player: IPlayerData, card: IUUIDCard) {
//         player.hand.insert(card);
//     }

//     playCardFromHand(player: IPlayerData, cardUUID: number, x: number, y: number): ICardBoardState {
//         const card = player.hand.removeByUUID(cardUUID);
//         if(card){
//             const placementInfo = {
//                 x,
//                 y,
//                 card,
//                 rotation: 0,
//                 player: player.username
//             };
//             this.boardState.push(placementInfo)
//             return placementInfo;
//         }
//     }

//     moveCardToBreakZone(player: IPlayerData, cardUUID: number){
//         const cardIndex = this.boardState.findIndex(cardState => cardState.card.uuid === cardUUID);
//         if(cardIndex > -1){
//             const card = this.boardState.splice(cardIndex, 1)[0].card;
//             player.breakZone.insert(card);
//         }
//     }

//     updateCardPositionOnBoard(player: IPlayerData, cardUUID: number, x: number, y: number, rotation = 0) {
//         //TODO change to card container
//         const cardIndex = this.boardState.findIndex(cardState => cardState.card.uuid === cardUUID);
//         if(cardIndex > -1){
//             const card = this.boardState.splice(cardIndex, 1)[0].card;
//             player.breakZone.insert(card);
//         }
//     }

//     getPlayer(username: string): IPlayerData{
//         return this.players.find(user => username === user.username);
//     }

//     // onCompletion(): Promise<any> {}
// }

export interface IGameEvent{
    op: string;
    username: string;
    data: any;
}

export const GAME_EVENT = "message"

export class GamesHandler{
    games: IBoardState[] = [];
    usersMap: Record<string, IBoardState> = {};

    private _server: socketio.Server;
    private _actions: GameBindingsHandler;

    constructor(server: socketio.Server, actions: GameBindingsHandler){
        this._server = server;
        this._actions = actions;
    }

    addSocket(userSocket: IUserSocket){
        userSocket.socket.on(GAME_EVENT, (event) =>  this.applyPlayerAction(userSocket, event) );
    }

    newGame(player: IUserSocket, player2: IUserSocket){
        const id = uuid();
        let gameState = getState(id);
        
        addPlayerContainers(player.username, gameState);
        insertDeckAndSetHand(gameState, data.cards, player.username);
        addGridContainers(player.username, gameState, 'forward', 8, 1);
        addGridContainers(player.username, gameState, 'backup', 5, 1);

        player.socket.join(id);
        this.usersMap[player.username] = gameState;


        const player2Username = player2.username || "test";
        addPlayerContainers(player2Username, gameState);
        insertDeckAndSetHand(gameState, data.cards.reverse(), player2Username);
        addGridContainers(player2Username, gameState, 'forward', 8, 1);
        addGridContainers(player2Username, gameState, 'backup', 5, 1);


        if(player2) {
            player2.socket.join(id);
            this.usersMap[player2.username] = gameState;

            player2.socket.emit(GAME_EVENT, {
                op: "initialBoardState",
                data: {
                    ...gameState,
                    activePlayer: player2.username
                }
            });
        }

        

        player.socket.emit(GAME_EVENT, {
            op: "initialBoardState",
            data: {
                ...gameState,
                activePlayer: player.username
            }
        });
        this.games.push(gameState);
        console.log("game created")
    }

    applyPlayerAction(userSocket: IUserSocket, event: IGameEvent){
        console.log(event);
        const game = this.usersMap[userSocket.username];
        // const player = game.getPlayer(userSocket.username);
        /*
        log message is meant to be human readable to distinctly display what action the user took
        user distint message is optionally used to send "private" state to the user performing the action
        group message is optionally used to send publicly visible state to all users within the match
        */
        const f = this._actions.resolveBinding(event.op);

        if(f){
            const {userDistinctMessageData, groupMessageData, logMessage } = f(game, event.data, userSocket.username) ;

            if(userDistinctMessageData){
                userSocket.socket.emit(GAME_EVENT, userDistinctMessageData);
            }
            if(groupMessageData){
                this._server.to(game.gameId).emit(GAME_EVENT, groupMessageData);
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