import { RoomController } from 'RoomController/RoomController';
import { IAttackData, IClientRequest, IRandomAttackData, IShipsData, IUser } from 'types';
import { UserController } from 'UserController/UserController';
import { rooms, socketsUser, winnersTable } from 'usersDB';
import { createGameRes, createRegResponse, createUpdateRoomRes, createUpdateWinnersRes } from 'helpers';

export class RequestHandler {
  public userController: UserController;
  public roomController: RoomController;

  constructor(users: Array<IUser>) {
    this.userController = new UserController(users);
    this.roomController = new RoomController(rooms);
  }

  async handleRegRequest({ type, data, id}: IClientRequest, ws: WebSocket) {
    const { name, password} = data;
    try {
      const result = await this.userController.checkIsExisting(data);
      socketsUser.set(ws, result.id);

      return createRegResponse({ data: result, type, id, isError: false, errorText: ''});
    } catch (error) {
      const isError = true;
      const errorMessage = (error as unknown as Error).message;
      return createRegResponse({ data: {name, password, id: ''}, type, id, isError, errorText: errorMessage});
    }
  }

  async getUpdatedWinnersTable (userId: string, userName: string) {
    const winnerData = winnersTable.get(userId);
    const result = {name: userName, wins: 0};
    if(winnerData) {
      result.wins = winnerData.wins;
    } else {
      winnersTable.set(userId, result);
    }
    const winners = Array.from(winnersTable.values());
    console.log('Winners', winners);
    const updatedTable = createUpdateWinnersRes(winners,  0);
    return updatedTable;
  }

  async createRoom(ws: WebSocket) {
    try {
      const userId = socketsUser.get(ws);
      if(!userId) {
        throw new Error('User not found');
      }
      const user = this.userController.users.find(user => user.id === userId) as IUser;
      const room = await this.roomController.addRoom(user.id, user.name, ws);
      return createGameRes({ playerId: user.id, gameId: room.roomId, id: 0});
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
    try {
      const userId = socketsUser.get(ws);
      if(!userId) {
        throw new Error('User not found');
      }
      const user = this.userController.users.find(user => user.id === userId) as IUser;
      this.roomController.addUserToRoom(roomIndex, user.id, user.name, ws );
      return createGameRes({ playerId: userId, gameId: roomIndex, id: 0});
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
      return this.roomController.updateGameState(data);
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }

  async makeARandomShot(data: IRandomAttackData) {
    try {
      this.roomController.makeARandomShot(data);
    } catch (error) {
      const errorMessage = (error as unknown as Error).message;
      console.error(errorMessage, 'err');
    }
  }
}