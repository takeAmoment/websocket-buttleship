import { ErrorMessagesEnum } from 'enums';
import { Room } from 'Room/Room';
import { IShipsData } from 'types';

export class RoomController {
  public rooms: Array<Room>;

  constructor(rooms: Array<Room>) {
    this.rooms = rooms;
  }

  async addRoom(userId: string, userName: string, ws: WebSocket) {
    const room = new Room();
    room.roomUsers.push({ name: userName, index: userId});
    room.game.setPlayer1({ name: userName, index: userId, ws});

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

  async addUserToRoom(roomId: string, userId: string, userName: string, ws: WebSocket) {
    try {
      const room = this.findRoom(roomId);

      if(!room || room.roomUsers.length === 2) {
        throw new Error(ErrorMessagesEnum.FULL_ROOM);
      }

      room.roomUsers.push({name: userName, index: userId});
      room.game.setPlayer2({name: userName, index: userId, ws});
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
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
      console.log('ADD board', gameId, indexPlayer, room.game.player1?.index, room.game.player2?.index);
      if(room.game.player1?.index === indexPlayer) {
        room.game.setPlayer1Board(ships);
      } else {
        room.game.setPlayer2Board(ships);
      }
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
  }

  getRooms() {
    return this.rooms;
  }
}