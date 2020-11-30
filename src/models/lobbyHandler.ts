
import { Server as socketio, Socket } from "socket.io";
import { IBaseEvent } from "./event.interface";
import { UserSocket } from "./user";
import { UserHandler } from "./userHandler";

export const LOBBY_ROOM = "LOBBY"
export const LOBBY_EVENT = "LOBBY"

export interface ILobby{
    name: string;
    creator: string;
    password?: string;
    joinedGame: string[];
}

export type lobbyEventOps =  "insert" | "remove" | "start";

export interface ILobbyEvent extends IBaseEvent{
    lobby: ILobby;
}

export class Lobbyhandler{
    
    _lobbies: ILobby[] = [];

    constructor(){}

    upsertLobby(lobby: ILobby): ILobby {
        const existingLobby = this._lobbies.findIndex(l => lobby.creator === l.creator);
        if(existingLobby > -1){
            this._lobbies[existingLobby] = lobby;
        }else{
            lobby.joinedGame = [lobby.creator];
            this._lobbies.push(lobby);
        }

        return lobby;
    }

    //return whether or not a lobby was actually removed
    closeLobby(lobbyId: string): boolean{
        const existingLobby = this._lobbies.findIndex(l => lobbyId === l.creator);
        if(existingLobby > -1){
            this._lobbies.splice(existingLobby, 1);
        }

        return existingLobby > -1;
    }

    getLobbies() {
        console.log(this._lobbies)
        return this._lobbies;
    }
}

export class LobbyhandlerSystem{

    lobby: Lobbyhandler = new Lobbyhandler();

    _server: socketio;

    constructor(server: socketio, private userHandler: UserHandler){
        this._server = server;
        console.log("initialized lobbyHandler")
    }

    addSocket(socket: UserSocket) {
        socket.socket.join(LOBBY_ROOM);
        socket.listen(LOBBY_EVENT, (event) => this.handleEvent(event, socket.username, this.lobby));
    }

    handleEvent(lobbyEvent: ILobbyEvent, username: string, lobby: Lobbyhandler){
        console.log("lobby", lobbyEvent);
        if(lobbyEvent.op === "insert"){
            lobby.upsertLobby(lobbyEvent.data);
            this._server.to(LOBBY_ROOM).emit(LOBBY_EVENT, {op:"insert", data: lobbyEvent.data})
        }else if(lobbyEvent.op === "remove"){
            const existed = lobby.closeLobby(lobbyEvent.data.creator);
            if(existed){
                this._server.to(LOBBY_ROOM).emit(LOBBY_EVENT, lobbyEvent);
            }
        }else if(lobbyEvent.op === "all") {
            const resp = {op:"all", data: lobby.getLobbies()};
            // console.log(lobby)
            this.userHandler.emitToUser(username,LOBBY_ROOM, resp);
        }else if(lobbyEvent.op === "startgame") {
            const existingLobby = this.lobby.getLobbies().find(l => username === l.creator);
            if(existingLobby) {
                
            }
            
        }else if(lobbyEvent.op === "requestjoingame") {
            const game = lobbyEvent.data.game;
            const existingLobby = this.lobby.getLobbies().find(l => game === l.name);
            
            if(existingLobby) {
                if(!existingLobby.joinedGame.includes(username)) {
                    existingLobby.joinedGame.push(username);
                }
            }
        }
    }
    

}

//assuming only one lobby per person?