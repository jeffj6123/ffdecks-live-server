import { IBoardState } from "./board/boardState";

export interface IEventData {
    logMessage: string;
    userDistinctMessageData: {};
    groupMessageData: {};
}

function getEventData(): IEventData {
    return {
        logMessage: "",
        userDistinctMessageData: {},
        groupMessageData: {}
    }
}

export interface IMoveCardEventData {
    previousContainer: string;      
    nextContainer: string;
    previousIndex: number,
    currentIndex: number
}

export function moveCard(game: IBoardState, data: IMoveCardEventData, username: string): IEventData {
    let r = getEventData();

    const cardId = game.containers[data.previousContainer][data.previousIndex];
    const card = game.cards[cardId];

    if(card.owner === username) {
        game.containers[data.previousContainer].splice(data.previousIndex, 1);
        game.containers[data.nextContainer].splice(data.currentIndex, 0, cardId);
    }

    r.groupMessageData = {op:"moveCard", data};

    return r;
}

export interface IRotateCardEventData {
    cardId: string;      
    rotation: number;
}

export function rotateCard(game: IBoardState, data: IRotateCardEventData, username: string): IEventData {
    let r = getEventData();

    const card = game.cards[data.cardId];

    if(card.owner === username) {
        card.metaData.rotation = data.rotation;
    }

    r.groupMessageData = {op:"rotateCard", data};

    return r;
}

export function getState(game: IBoardState, data: any, username: string): IEventData {
    let r = getEventData();

    r.userDistinctMessageData = {op:"state", data: {...game, activePlayer: username}};
    
    return r;
}

export class GameBindingsHandler {
    private _actions: Record<string, Function> = {};

    public addGameBinding(eventName: string, f: Function): void {
        if(eventName in this._actions){
            throw new Error(`${eventName} already exists in game bindings.`)
        }

        this._actions[eventName] = f;
    }

    /*
    returns null if binding doesnt exist
    */
    public resolveBinding(eventName: string): Function {
        if(eventName in this._actions){
            return this._actions[eventName];
        }

        return null;
    }
}

