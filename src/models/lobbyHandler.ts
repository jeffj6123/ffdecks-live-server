
import * as socketio from "socket.io";

export const LOBBY_ROOM = "LOBBY"
export const LOBBY_EVENT = "LOBBY"

export interface ILobby{
    name: string;
    creator: string;
    password?: string;
}

export type lobbyEventTypes =  "upsert" | "remove";

export interface ILobbyEvent{
    lobby: ILobby;
    type: lobbyEventTypes;
}

export class Lobbyhandler{
    
    _lobbies: ILobby[] = [];

    constructor(){}

    upsertLobby(lobby: ILobby): ILobby {
        const existingLobby = this._lobbies.findIndex(l => lobby.creator === l.creator);
        if(existingLobby > -1){
            this._lobbies[existingLobby] = lobby;
        }else{
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

}

export class LobbyhandlerSystem{

    lobby: Lobbyhandler = new Lobbyhandler();

    _server: socketio.Server;

    constructor(server: socketio.Server){
        this._server = server;
        console.log("initialized lobbyHandler")
    }

    addSocket(socket: socketio.Socket) {
        socket.join(LOBBY_ROOM);
        socket.on(LOBBY_EVENT, this.handleEvent.bind(this));
    }

    handleEvent(lobbyEvent: ILobbyEvent){
        if(lobbyEvent.type === "upsert"){
            this.lobby.upsertLobby(lobbyEvent.lobby);
            this._server.to(LOBBY_ROOM).emit(LOBBY_EVENT, lobbyEvent)
        }else if(lobbyEvent.type === "remove"){
            const existed = this.lobby.closeLobby(lobbyEvent.lobby.creator);
            if(existed){
                this._server.to(LOBBY_ROOM).emit(LOBBY_EVENT, lobbyEvent);
            }
        }
    }
    

}

//assuming only one lobby per person?