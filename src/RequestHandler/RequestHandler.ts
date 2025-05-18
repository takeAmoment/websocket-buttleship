import { RoomController } from 'RoomController/RoomController';
import { IAttackData, IClientRequest, IShipsData, IUser } from 'types';
import { UserController } from 'UserController/UserController';
import { rooms } from 'usersDB';
import { createGameRes, createRegResponse, createUpdateRoomRes } from 'utils';

export class RequestHandler {
  public userController: UserController;
  public roomController: RoomController;
  public currentUser: IUser;

  constructor(users: Array<IUser>) {
    this.userController = new UserController(users);
    this.roomController = new RoomController(rooms);
  }

  setCurrentUser(user: IUser) {
    this.currentUser = user;
  }

  async handleRegRequest({ type, data, id}: IClientRequest) {
    const { name, password} = data;
    try {
      const result = await this.userController.checkIsExisting(data);
      this.setCurrentUser(result);

      return createRegResponse({ data: result, type, id, isError: false, errorText: ''});
    } catch (error) {
      const isError = true;
      const errorMessage = (error as unknown as Error).message;
      return createRegResponse({ data: {name, password, id: ''}, type, id, isError, errorText: errorMessage});
    }
  }

  async createRoom(ws: WebSocket) {
    try {
      const room = await this.roomController.addRoom(this.currentUser.id, this.currentUser.name, ws);
      return createGameRes({ playerId: this.currentUser.id, gameId: room.roomId, id: 0});
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }

  async getUpdatedRooms() {
    try {
      const rooms = this.roomController.getRoomsWithOnePlayer();
      return createUpdateRoomRes({id: 0, rooms});
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }

  async updateRoom(roomIndex: string, ws: WebSocket) {
    const { id, name} = this.currentUser;
    try {
      this.roomController.addUserToRoom(roomIndex, id, name, ws );
      return createGameRes({ playerId: id, gameId: roomIndex, id: 0});
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }

  async addGameData(data: IShipsData) {
    try {
      this.roomController.addBoardData(data);
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }

  }


  async makeAShoot(data: IAttackData) {
    try {
      this.roomController.updateGameState(data);
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }
}