import { Game } from 'Game';
import { IRoom, IRoomUser } from 'types';
import { v4 as uuidv4 } from 'uuid';

export class Room implements IRoom {
  public roomId: string;
  public roomUsers: Array<IRoomUser>;
  public game: Game;

  constructor() {
    this.roomId = uuidv4();
    this.roomUsers = [];
    this.game = new Game();
  }

  isUserInRoom(userId: string): boolean {
    return this.roomUsers.some((user) => user.index === userId);
  }

  // Add validation when adding user
  addUser(userId: string, userName: string): boolean {
    if (this.isUserInRoom(userId)) {
      return false;
    }
    if (this.roomUsers.length >= 2) {
      return false;
    }
    this.roomUsers.push({ index: userId, name: userName });
    return true;
  }
}
