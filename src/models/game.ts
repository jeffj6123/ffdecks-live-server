import { IUUIDCard } from "../interfaces/ICard";
import { IUserSocket } from "./user";
import uuid = require("uuid");
import * as socketio from "socket.io";


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

export interface ICardBoardState{
    x: number;
    y: number;
    rotation: number;
    card: IUUIDCard;
    player: string;
}

export interface IPlayerData {
    username: string;
    deck: Deck;
    breakZone: CardContainer;
    hand: CardContainer;
}

export interface IDrawCard {
    deckLength: number;
    card: IUUIDCard;
    handSize: number;
}

export class Game {
    id: string;
    players: IPlayerData[];

    boardState: ICardBoardState[];

    _onGameFinished: Promise<any>;

    constructor(id: string, players: {deck: Deck, username: string}[]){
        this.id = id;
        this.players = players.map(data => { return {
            username: data.username,
            deck: data.deck,
            breakZone: new CardContainer([]),
            hand: new CardContainer([])}
            })

        this._onGameFinished = new Promise( (resolve, reject) => {

        })

    }

    drawCard(player: IPlayerData): IDrawCard {
        const card = player.deck.drawCard();
        const deckLength = player.deck.length;
        this.addCardToHand(player, card);
        const handSize = player.hand.length;
        return {
            deckLength,
            card,
            handSize
        }
    }

    addCardToHand(player: IPlayerData, card: IUUIDCard) {
        player.hand.insert(card);
    }

    playCardFromHand(player: IPlayerData, cardUUID: number, x: number, y: number): ICardBoardState {
        const card = player.hand.removeByUUID(cardUUID);
        if(card){
            const placementInfo = {
                x,
                y,
                card,
                rotation: 0,
                player: player.username
            };
            this.boardState.push(placementInfo)
            return placementInfo;
        }
        null;
    }

    moveCardToBreakZone(player: IPlayerData, cardUUID: number){
        const cardIndex = this.boardState.findIndex(cardState => cardState.card.uuid === cardUUID);
        if(cardIndex > -1){
            const card = this.boardState.splice(cardIndex, 1)[0].card;
            player.breakZone.insert(card);
        }
    }

    updateCardPositionOnBoard(player: IPlayerData, cardUUID: number, x: number, y: number, rotation = 0) {
        const cardIndex = this.boardState.findIndex(cardState => cardState.card.uuid === cardUUID);
        if(cardIndex > -1){
            const card = this.boardState.splice(cardIndex, 1)[0].card;
            player.breakZone.insert(card);
        }
    }

    getPlayer(username: string): IPlayerData{
        return this.players.find(user => username === user.username);
    }

    // onCompletion(): Promise<any> {}
}

export interface IGameEvent{
    type: string;
    username: string;
    data: any;
}

export const GAME_EVENT = "game"

export class GamesHandler{

    games: Game[] = [];
    usersMap: Record<string, Game> = {};

    _server: socketio.Server;

    constructor(server: socketio.Server){
        this._server = server;
    }

    addSocket(userSocket: IUserSocket){
        userSocket.socket.on(GAME_EVENT, (event) =>  this.applyPlayerAction(userSocket, event) );
    }

    newGame(player: IUserSocket, player2: IUserSocket){
        let cards = [{uuid: 0, id: 1}, {uuid: 1, id: 1}, {uuid: 2, id: 1}, {uuid: 3, id: 1}, {uuid: 4, id: 1}]
        const id = uuid();
        const game = new Game(id, [
            {
                deck: new Deck(cards),
                username: player.username
            },
            {
                deck: new Deck(cards.map(card => card)),
                username: player2.username
            }
        ]);
        
        console.log("new game");
        
        const data = {
            id,

        }

        player.socket.join(id);
        player2.socket.join(id);

        this._server.to(game.id).emit(GAME_EVENT, data);

        this.usersMap[player.username] = game;
        this.usersMap[player2.username] = game;

        this.games.push(game);
    }

    applyPlayerAction(userSocket: IUserSocket, event: IGameEvent){
        const game = this.usersMap[userSocket.username];
        const player = game.getPlayer(userSocket.username);
        /*
        log message is meant to be human readable to distinctly display what action the user took
        user distint message is optionally used to send "private" state to the user performing the action
        group message is optionally used to send publicly visible state to all users within the match
        */
        let logMessage = "";
        let userDistinctMessageData = null;
        let groupMessageData = null;
        switch (event.type) {
            case "DrawFromDeck":

                break;
        
            
            default:
                break;
        }

        if(userDistinctMessageData){
            userSocket.socket.emit(GAME_EVENT, userDistinctMessageData);
        }
        if(groupMessageData){
            this._server.to(game.id).emit(GAME_EVENT, groupMessageData);
        }

        this._server.to(game.id).emit(GAME_EVENT, {type: "log", message: logMessage})
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