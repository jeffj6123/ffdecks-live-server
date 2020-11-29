import { ICard } from "./card";
import { gridFormat } from "./boardUtils";
import { BREAKZONE_IDENTIFIER, DAMAGE_IDENTIFIER, DECK_IDENTIFIER, HAND_IDENTIFIER, REMOVED_IDENTIFIER } from "./constants";

export interface IBoardState {
    gameId: string;
    containers: Record<string, string[]>;
    cards: Record<string, IBoardStateCard<ICard>>;
    players: string[];
}

export interface IBoardStateCard<T> {
    metaData: IBoardStateMetaData;
    guid: string;
    data: T;
    owner: string;
    shared?: boolean;
}

export interface IBoardStateMetaData {
    rotation: number;
}


export const getState = (gameId: string): IBoardState =>{
    return {
        containers: {},
        cards: {},
        players: [],
        gameId
    }
};


/*
Add breakzone, hand, removed, 
*/
export const addPlayerContainers = (playerIdentifier: string, state: IBoardState) => {
    state.containers[`${playerIdentifier}-${DECK_IDENTIFIER}`] = [];
    state.containers[`${playerIdentifier}-${BREAKZONE_IDENTIFIER}`] = [];
    state.containers[`${playerIdentifier}-${HAND_IDENTIFIER}`] = [];
    state.containers[`${playerIdentifier}-${REMOVED_IDENTIFIER}`]  = [];
    state.containers[`${playerIdentifier}-${DAMAGE_IDENTIFIER}`]  = [];
    state.players.push(playerIdentifier);
}

export const addGridContainers = (playerIdentifier: string, state: IBoardState, gridType: string, height: number, width: number ) => {
    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
          const id = gridFormat(playerIdentifier, gridType, i, j);
          state.containers[id] = [];
        }
      }
}