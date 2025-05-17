import { Game } from 'Game';
import { RoomController } from 'RoomController/RoomController';
import { IClientRequest, IUser } from 'types';
import { UserController } from 'UserController/UserController';
import { rooms } from 'usersDB';
import { createGameRes, createRegResponse, createUpdateRoomRes } from 'utils';

export class RequestHandler {
  public userController: UserController;
  public roomController: RoomController;
  public game: Game;
  public currentUser: IUser;

  constructor(users: Array<IUser>) {
    this.userController = new UserController(users);
    this.roomController = new RoomController(rooms);
    this.game = new Game();
  }

  setCurrentUser(user: IUser) {
    this.currentUser = user;
  }

  async handleRegRequest({ type, data, id}: IClientRequest) {
    const { name, password} = data;
    try {
      const result = await this.userController.checkIsExisting(data);
      this.game.setPlayer1(result);
      this.setCurrentUser(result);

      return createRegResponse({ data: result, type, id, isError: false, errorText: ''});
    } catch (error) {
      const isError = true;
      const errorMessage = (error as unknown as Error).message;
      return createRegResponse({ data: {name, password, id: ''}, type, id, isError, errorText: errorMessage});
    }
  }

  async createRoom() {
    try {
      this.roomController.addRoom(this.currentUser.id, this.currentUser.name);
      return createGameRes({ playerId: this.currentUser.id, gameId: this.game.gameId, id: 0});
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }

  async updateRoom() {
    try {
      const rooms = this.roomController.getRoomsWithOnePlayer();
      return createUpdateRoomRes({id: 0, rooms});
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }
}