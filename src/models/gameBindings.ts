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

function drawCardFromDeck(game: Game, data: any, username: string): IEventData {
    let r = getEventData();

    console.log("draw from deck")
    const player = game.getPlayer(username);
    const cardDrawData = game.drawCard(player);

    r.userDistinctMessageData = cardDrawData;
    r.groupMessageData = {username: username, handLength: cardDrawData.handSize, deckLength: cardDrawData.deckLength};
    r.logMessage = `${username} Drew 1 card`;

    return r;
}
