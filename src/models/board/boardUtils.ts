import { ICard, ICardAndQuantity } from "./card";
import { IBoardState, IBoardStateCard } from "./boardState";
import { v4 as uuidv4 } from 'uuid';
import { DECK_IDENTIFIER, HAND_IDENTIFIER } from "./constants";

export const containerFormat = (playerIdentifier: string, id: string) => {
  return `${playerIdentifier}-${id}`;
}

export const gridFormat = (playerIdentifier: string, gridType: string, x: number | string, y: number | string) => {
  return `${playerIdentifier}-${gridType}-grid-${x.toString()},${y.toString()}`
}


export const insertDeckAndSetHand = (state: IBoardState, cards: ICardAndQuantity[], player: string, startingHandSize: number = 5) => {
  const deckref = containerFormat(player, DECK_IDENTIFIER);

  cards.forEach(card => {
    for(let i = 0; i < card.quantity; i++){
      const cardInfo: IBoardStateCard<ICard> = {
        guid: uuidv4(),
        data: card.card,
        metaData: {
          rotation: 0
        },
        owner: player,
        shared: true
      }
      state.cards[cardInfo.guid] = cardInfo;
      state.containers[deckref].push(cardInfo.guid);
    }
  })

//   UtilitiesService.shuffle(state.containers[deckref]);
  const startingHand = state.containers[deckref].splice(0, startingHandSize);
  state.containers[containerFormat(player, HAND_IDENTIFIER)] = startingHand;

} 