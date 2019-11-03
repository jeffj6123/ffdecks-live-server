import { Game } from "./game";

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

export function drawCardFromDeck(game: Game, data: any, username: string): IEventData {
    let r = getEventData();

    console.log("draw from deck")
    const player = game.getPlayer(username);
    const cardDrawData = game.drawCard(player);

    r.userDistinctMessageData = cardDrawData;
    r.groupMessageData = {username: username, handLength: cardDrawData.handSize, deckLength: cardDrawData.deckLength};
    r.logMessage = `${username} Drew 1 card`;

    return r;
}

export function playCardFromHand(game: Game, data: any, username: string): IEventData {
    let r = getEventData();

    console.log("play from hand")
    const player = game.getPlayer(username);
    const cardData = game.playCardFromHand(player, data.cardUUID, data.x, data.y);
    const handLength = player.hand.length;

    // r.userDistinctMessageData = cardData;
    r.groupMessageData = {username: username, card: cardData, handLength: handLength};
    r.logMessage = `${username} Played a card`; //TODO put name here

    return r;
}

export function moveCard(game: Game, data: any, username: string): IEventData {
    let r = getEventData();

    console.log("draw from deck")
    const player = game.getPlayer(username);
    const cardData = game.playCardFromHand(player, data.cardUUID, data.x, data.y);
    const handLength = player.hand.length;

    // r.userDistinctMessageData = cardData;
    r.groupMessageData = {username: username, card: cardData, handLength: handLength};
    r.logMessage = `${username} moved a card`;

    return r;
}

export function moveCardToBreakZone(game: Game, data: any, username: string): IEventData {
    let r = getEventData();

    console.log("move card to break zone")
    const player = game.getPlayer(username);
    const cardData = game.moveCardToBreakZone(player, data.cardUUID);

    // r.userDistinctMessageData = cardData;
    r.groupMessageData = {username: username, board: [], breakZone: []};
    r.logMessage = `${username} moved a card`;

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

