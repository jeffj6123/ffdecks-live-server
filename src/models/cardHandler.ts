import { ICard } from "../interfaces/ICard";
import axios from 'axios';

interface ICardsInfo{
    version: number;
    cards: ICard[];
}

export class CardHandler{
    cards: ICard[] = [];

    constructor(){}

    initialize(): Promise<void> {
        return new Promise( (resolve, reject) => {
            axios.get<ICardsInfo>('http://ffdecks.com/api/cards/basic').then(res => {
                this.cards = res.data.cards;
                //this.parseCards();
                resolve();
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        })
    }
}
//     //This will sort the cards into sets and then by rarities
//     //this is used for when generating packs to reduce the amount of overhead
//     parseCards() {
//         let sets: ICard[][];

//         //first split the cards into sets
//         this.cards.forEach(card => {
//             const setNum = +card.serial_number.split('-');
//             sets[setNum - 1].push(card);
//         })

//         //split sets into rarities
//         sets.forEach( (cards, index) => {
//             let rares: ICard[] = [];
//             let commons: ICard[] = [];
//             let heroLegends: ICard[] = [];
//             cards.forEach(card => {
//                 switch(card.rarity){
//                     case "Common":
//                         commons.push(card);
//                         break;
//                     case "Rare":
//                         rares.push(card);
//                         break;
//                     case "Hero":
//                     case "Legend":
//                         heroLegends.push(card);
//                         break;
//                 }
//             })
//             this.cachedOpusBreakdowns[index + 1] = {
//                 commons,
//                 rares,
//                 heroLegends,
//                 all: cards
//             }
//         })
//     }
    
//     getOpus(opus: number): ICachedOpus {
//         return this.cachedOpusBreakdowns[opus];
//         //TODO maybe handle bad cache attempts?
//     }

//     /*
//          12 cards per pack.
//          1 hero or legend
//          3 rare
//          7 common
//          1 foil of any rarity (odds defined by qty of that rarity in set, ex 14/158  for legend or w/e)

//          4 packs in a draft per player
//         */
//     generatePack(opus: number, count: number): ICard[][] {
//         const cards = this.getOpus(opus);

//         return []
//     }

// }

// /*
// used to randomly generate packs
// n: amount to randomly pick
// m: number of possible items
// Idea is to effectively "swap" items up to spot n to provide a unique integer list.
// i.e n =3, m = 5, let r be a random number and a = []
// if r > a.length

// 1 ,2 ,3 ,4 ,5
// when n = 0, let r = 4

// so a = [5]

// when n = 1, let r = 2




// */
// let pickRandomList = (n: number, m: number): number[] => {
//     return []
// 