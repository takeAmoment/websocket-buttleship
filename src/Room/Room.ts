import { Game } from 'Game';
import { IRoom, IRoomUser } from 'types';
import { v4 as uuidv4 } from 'uuid';

export class Room implements IRoom{
  public roomId: string;
  public roomUsers: Array<IRoomUser>;
  public game: Game;

  constructor() {
    this.roomId = uuidv4(); 
    this.roomUsers = [];
    this.game = new Game();
  }
}