// import { IUser } from "../models/user";
// import { ICard } from "../interfaces/ICard";
// import { ICardHandler } from "../models/cardHandler";
// import { EventEmitter } from "events";

// //client
// const REQUESTHAND = 'gethand';

// //server
// const GETHAND = 'currenthand';

// export class BaseGroupUser {
//     user: IUser;
// }

// export class BaseGroup {
//     userData: BaseGroupUser[];
//     eventEmitter: EventEmitter
//     constructor(){
//         this.eventEmitter = new EventEmitter();
//     }

//     complete(): void {
//         this.eventEmitter.emit('complete', this)
//     }
//     /*
//     Will send a message to every user by calling the data function,
//     The data function can take in the user itself for context.
//     */
//     emitToAll(message: string, data: Function ){
//         this.userData.forEach(user => {
//             user.user.sendMessage(message, data(user) );
//         })        
//     }
// }

// export class DraftHandler{
//     groupSize: number;
//     cardHandler: ICardHandler;
//     constructor(cardHandler: ICardHandler, groupSize: number = 1){
//         this.cardHandler = cardHandler;
//         this.groupSize = groupSize;
//     }

//     groups: Draft[] = [];
//     queuedUsers: IUser[] = [];
//     enqueueUser(user: IUser): void {
//         if(!this.queuedUsers.some(u => user === u) && !user.context['draft']){
//             user.context['queued'] = true;
//             this.queuedUsers.push(user);
//             if(this.queuedUsers.length === this.groupSize){
//                 this.createGroup();
//             }
//         }
//     }

//     dequeueUser(user: IUser): void {
//         this.queuedUsers = this.queuedUsers.filter(u => user !== u);
//         delete user.context['queued'];
//     }

//     createGroup(): void{
//         let d = new Draft(this.queuedUsers, this.cardHandler, 1);
//         this.groups.push(d);
//         //TODO consider emitting a not in queue 
//         this.queuedUsers.forEach(user => {
//             delete user.context['queued'];
//         })
//         this.queuedUsers = [];

//         //be able to remove the group after completion
//         d.eventEmitter.on('complete', (group: BaseGroup) => {
//             console.log('finished');
//             group.emitToAll('canqueue', () => '');
//             this.removeGroup(group);
//         })
//     }

//     removeGroup(group: BaseGroup): void {
//        this.groups = this.groups.filter(g => g !== group);
//     }

//     //for admin stuff
//     getDraftStates(): any[] {
//         let data: any[] = this.groups.map(group => {
//             return {
//                 round: group.currentRound,
//                 pack: group.currentPack,
//                 users: group.users.map(user => user.username)
//             }
//         })

//         return data;
//     }
// }

// export interface IDraftUserData extends BaseGroupUser{
//     cards: ICard[];
//     currentPick: number;
//     index: number;
// }

// export class Draft extends BaseGroup {
//     userData: IDraftUserData[] = [];
//     currentOptions: ICard[][];
//     currentRound: number = 1;
//     currentPack: number = 1;
//     timeLeft: number;

//     roundLength: number;
//     cardHandler: ICardHandler;

//     constructor(public users: IUser[], 
//                 cardHandler: ICardHandler,
//                 roundLength: number = 60){
//         super();
//         this.cardHandler = cardHandler;
//         this.roundLength = roundLength;
//         this.users.forEach( (user, index )=> {
//             user.context['draft'] = true;
//             this.userData.push({
//                 user,
//                 cards: [],
//                 currentPick: null,
//                 index
//             })
//         })
//         this.addListeners();

//         this.getCurrentOptions();
//         this.sendDraftStart();
//         this.startRound();
//         //start setting up interval
//     }

//     addListeners(): void {
//         this.userData.forEach( (user, index) => {
//             user.user.addListener(REQUESTHAND, this.sendPickedCards(user))
//             user.user.addListener('getcurrentoptions', this.sendCurrentOptions(user))
//             user.user.addListener('getcurrentpick', this.sendCurrentPick(user))
//             user.user.addListener('currentpick', this.getCurrentPick(user))
//         })

//     }

//     //LISTENER FUNCTIONS
//     sendPickedCards(user: IDraftUserData): (...args: any[]) => void {
//         return () => {
//             console.log(user)
//             user.user.sendMessage(GETHAND, user.cards);
//         }
//     }
//     sendCurrentOptions(user: IDraftUserData){
//         return () => {
//             user.user.sendMessage('currentoptions', this.currentOptions[user.index]);
//         }
//     }
//     sendCurrentPick(user: IDraftUserData){
//         return () => {
//             user.user.sendMessage('currentpick', user.currentPick);
//         }
//     }
//     getCurrentPick(user: IDraftUserData){
//         return (data: {pick: number}) => {
//             console.log(data);
//             if(data.pick < this.currentOptions[user.index].length){
//                 user.currentPick =  data.pick; //this.currentOptions[user.index][data.pick];
//             }
//             this.sendCurrentPick(user);
//         }
//     }

//     //PUSH 
//     sendDraftStart(){
//         let f = () => '';
//         this.emitToAll('draftstart', f);
//     }
//     sendNewRound(){
//         let f = () => { return {currentPack : this.currentPack, 
//                                 currentRound: this.currentRound}};
//         this.emitToAll('newround', f);
//     }
//     sendTimeLeft(){
//         let f = () => {return {timeLeft: this.timeLeft}};
//         this.emitToAll('timeleft', f);
//     }

//     sendGameOver(){
//         this.emitToAll('gameover', () => '')
//     }

//     //INTERNALS
//     /*
//     shift over the current options for each person
//     */
//     shiftCurrentOptions(){
//         const first = this.currentOptions[0];

//         for(let i = 0; i < this.currentOptions.length - 1; i ++){
//             this.currentOptions[i] = this.currentOptions[i+1];
//         }

//         this.currentOptions[0] = this.currentOptions[this.currentOptions.length - 1];
//     }

//     startRound(): void {
//         this.sendNewRound();
//         this.userData.forEach( (user) => {
//             console.log("sending pick")
//             this.sendCurrentOptions(user)();
//         })
//         this.currentRound ++;
//         //GET NEW PACK
//         if(this.currentRound === 13 ){
//             this.currentPack ++;

//             //only if we dont have a new pack
//             if(this.currentPack <= 4){
//                 this.getCurrentOptions();
//                 this.currentRound = 1;
//             }
//         }
//         if(this.currentPack === 5){
//             console.log("GAME OVER")
//             //END OF GAME
//             this.users.forEach(user => {
//                 delete user.context['draft']
//             })
//             this.sendGameOver();
//             this.complete();
//         }else{
//             this.timeLeft = this.roundLength;

//             //countDown the time
//             let countDown = setInterval( () => {
//                 this.sendTimeLeft();
//                 this.timeLeft--;
//                 if(this.timeLeft <= 0){
//                     clearInterval(countDown);
//                     this.processSelectedCards();                    
//                     this.startRound();
//                 }
//             }, 1000)

//         }
//     }

//     processSelectedCards(){
//         this.userData.forEach(user => {
//             //TODO determine best way to handle unpicked card
//             if(user.currentPick === null){
//                 user.currentPick = 0;
//             }
//             this.currentOptions[user.index].splice(user.currentPick, 1);
//             console.log(this.currentOptions);
//         })
//     }

//     /*
//     generate next set of packs
//     */
//     getCurrentOptions(){
//         this.currentOptions = this.userData.map( () => []);
//         this.userData.forEach( (user) => {
//             this.currentOptions[user.index] = [{id:0}, {id:1},{id:2},{id:3},{id:4}, {id:5},{id:6},{id:7},{id:8}, {id:9},{id:10},{id:11}];
//         })
//     }

// }

// //TEST
