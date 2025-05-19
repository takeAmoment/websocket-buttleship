import { ErrorMessagesEnum } from 'enums';
import { Room } from 'Room/Room';
import { IAttackData, IRandomAttackData, IShipsData } from 'types';

export class RoomController {
  public rooms: Array<Room>;

  constructor(rooms: Array<Room>) {
    this.rooms = rooms;
  }

  addUserToRoom(roomId: string, userId: string, userName: string, ws: WebSocket) {
    const room = this.rooms.find(room => room.roomId === roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const isUserInAnyRoom = this.rooms.some(r => r.isUserInRoom(userId));

    if (isUserInAnyRoom) {
      throw new Error('User is already in a room');
    }

    const added = room.addUser(userId, userName);
    if (!added) {
      throw new Error('Cannot add user to room');
    }

    if (room.roomUsers.length === 1) {
      room.game.setPlayer1({ index: userId, name: userName, ws });
    } else {
      room.game.setPlayer2({ index: userId, name: userName, ws });
    }
  }

  async addRoom(userId: string, userName: string, ws: WebSocket) {
    const isUserInAnyRoom = this.rooms.some(room => room.isUserInRoom(userId));
    if (isUserInAnyRoom) {
      console.log('User is already', this.rooms);
      throw new Error('User is already in a room. Room');
    }

    const room = new Room();
    room.addUser(userId, userName);
    room.game.setPlayer1({ index: userId, name: userName, ws });
    this.rooms.push(room);
    return room;
  }

  findRoom(roomId: string) {
    const room = this.rooms.find((item) => item.roomId === roomId);
    if(!room) {
      throw new Error(ErrorMessagesEnum.ROOM_DOES_NOT_EXIST);
    }

    return room;
  }

  getRoomsWithOnePlayer() {
    const availableRooms = this.rooms.filter((room) => room.roomUsers.length === 1);

    return availableRooms;
  }

  async addBoardData(data: IShipsData) {
    const { gameId, ships, indexPlayer } = data;

    try {
      const room = this.findRoom(gameId);

      if(!room) {
        throw new Error(ErrorMessagesEnum.ROOM_DOES_NOT_EXIST);
      }
      // console.log('ADD board', gameId, indexPlayer, room.game.player1?.index, room.game.player2?.index);
      if(room.game.player1?.index === indexPlayer) {
        room.game.setPlayer1Board(ships);
      } else {
        room.game.setPlayer2Board(ships);
      }
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
  }

  updateGameState(data: IAttackData) {
    const { gameId } = data;

    try {
      const room = this.findRoom(gameId);

      if(!room) {
        throw new Error(ErrorMessagesEnum.ROOM_DOES_NOT_EXIST);
      }

      const res = room.game.makeAShot(data);
      if(res && res.isFinished) {
        const roomIndex = this.rooms.findIndex((item) => item.roomId === gameId);
        this.rooms.splice(roomIndex, 1);
        return res.updatedTable;
      }
      return null; 
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
  }

  makeARandomShot(data: IRandomAttackData) {
    const { gameId } = data;

    try {
      const room = this.findRoom(gameId);

      if(!room) {
        throw new Error(ErrorMessagesEnum.ROOM_DOES_NOT_EXIST);
      }

      const res = room.game.makeARandomShot(data);

      if(res && res.isFinished) {
        const roomIndex = this.rooms.findIndex((item) => item.roomId === gameId);
        this.rooms.splice(roomIndex, 1);
        return res.updatedTable;
      }
      return null; 
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
  }

  getRooms() {
    return this.rooms;
  }
}