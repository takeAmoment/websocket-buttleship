import { v4 as uuidv4 } from 'uuid';

import { IRoom, IUser } from 'types';

export class Game {
  public gameId: string;
  public player1: IUser | null;
  public player2?: IUser;
  public currentRoom: IRoom | null;

  constructor() {
    this.gameId = uuidv4();
    this.player1 = null;
    this.player2 = undefined;
    this.currentRoom = null;
  }

  setPlayer1 (user: IUser) {
    this.player1 = user;
  }

  setPlayer2 (user: IUser) {
    this.player2 = user;
  }

  setRoom (room: IRoom) {
    this.currentRoom = room;
  }
}