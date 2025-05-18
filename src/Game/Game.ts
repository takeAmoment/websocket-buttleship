import { v4 as uuidv4 } from 'uuid';

import { IPlayer, IShip } from 'types';
import { createStartGameRes } from 'utils/createStartGameRes';
import { createTurnRes } from 'utils/createTurnRes';

export class Game {
  public gameId: string;
  public player1: IPlayer | null;
  public player2?: IPlayer;
  public player1Board: Array<IShip> | null;
  public player2Board: Array<IShip> | null;
  public turn: IPlayer | null;
  // public currentRoom: IRoom | null;

  constructor() {
    this.gameId = uuidv4();
    this.player1 = null;
    this.player2 = undefined;
    this.player1Board = null;
    this.player2Board = null;
    this.turn = null;
    // this.currentRoom = null;
  }

  sendTurn(ws: WebSocket, currentIndex: string) {
    console.log('TURN', currentIndex, this.player1?.index, this.player2?.index);
    const response = createTurnRes(currentIndex, 0);
    ws.send(JSON.stringify(response));
  }

  startGame(ws: WebSocket, ships: Array<IShip>, id: number, playerIndex: string) {
    const response = createStartGameRes({ships, id, playerIndex});

    ws.send(JSON.stringify(response));
  }

  checkIsGameStarted() {

    if(this.player1 && this.player2 &&  this.player1Board && this.player2Board && this.turn) {
      this.player1.ws.send(JSON.stringify({type: 'SENDDD'}));
      this.player2.ws.send(JSON.stringify({type: 'PLAYER2'}));
      this.startGame( this.player1.ws, this.player1Board, 0, this.player1.index);
      this.startGame( this.player2.ws, this.player2Board, 0, this.player2.index);

      // this.sendTurn(this.player1.ws, this.turn?.index);
      this.sendTurn(this.player2.ws, this.turn?.index);
      // this.player1.ws.send(JSON.stringify({type: ClientMessageTypesEnum.START_GAME, id: 0, data: JSON.stringify({ ships: this.player1Board, currentPlayerIndex: this.player1.index })}));
      // this.player2.ws.send(JSON.stringify({type: ClientMessageTypesEnum.START_GAME, id: 0, data: JSON.stringify({ ships: this.player2Board, currentPlayerIndex: this.player2.index })}));
      // console.log('START GAME', this.player1, this.player2);
    }
  }

  setPlayer1 (user: IPlayer) {
    this.player1 = user;
    this.turn = user;
  }

  setPlayer2 (user: IPlayer) {
    this.player2 = user;
  }

  setPlayer1Board(data: Array<IShip>){
    this.player1Board = data;
    this.checkIsGameStarted();
  }

  setPlayer2Board(data: Array<IShip>) {
    this.player2Board = data;
    this.checkIsGameStarted();
  }

  // setRoom (room: IRoom) {
  //   this.currentRoom = room;
  // }
}