import { ICard } from "../interfaces/ICard";
import { ClientUser } from "./clientUser";

export class DraftUser {
    cards: ICard[];
    currentOptions: ICard[];
    currentPick: number;
    currentRound: number;
    currentPack: number;
    timeLeft: number;

    client: ClientUser
    
    constructor(client: ClientUser){
        this.client = client;
        this.client.addListener('draftstart', () => {
            console.log("draft start")
        });
        this.client.addListener("newround", this.getCurrentRound());
        this.client.addListener("timeleft", this.getTimeLeft());
        this.client.addListener("currentpick", this.getCurrentPick());
        this.client.addListener("currentoptions", this.getCurrentOptions());
        this.client.addListener("gameover", () => {
            console.log("game over");
        } )
        console.log(this.sendCurrentPick)
    }

    remove(): void {
        this.client.removeListener("newround");
        this.client.removeListener("timeleft");
        this.client.removeListener("currentpick");
        this.client.removeListener("currentoptions");
        this.client.removeListener("gameover");
    }

    //PULL
    requestHand(): void {
        this.client.sendMessage('gethand');
    }

    requestCurrentOptions(): void {
        this.client.sendMessage('getcurrentoptions');
    }

    requestCurrentPick(): void {
        this.client.sendMessage('getcurrentpick');
    }

    //PUSH
    sendCurrentPick(index: number): void {
        this.client.sendMessage('currentpick', {pick: index});
    }

    getCurrentOptions() {
        return (data: ICard[]) => {
            console.log(data);
            this.currentOptions = data;
            let index = Math.floor(Math.random() * this.currentOptions.length)
            console.log(index);
            this.sendCurrentPick(index);    
        }
    }
    getCurrentRound() {
        return (data: {currentPack: number, currentRound: number} ) => {
            this.currentPack = data.currentPack;
            this.currentRound = data.currentRound;
            console.log("new round");
        }
    }
    getTimeLeft() {
        return (data: any) => {
            console.log(data)
            this.timeLeft = data.timeLeft;
        }
    }
    getCurrentPick(){
        return (data: number) => {
            console.log(data);
            this.currentPick = data;
        }
    }
}