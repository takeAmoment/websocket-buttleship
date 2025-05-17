import { ErrorMessagesEnum } from 'enums';
import { Room } from 'Room/Room';
import { IRoom } from 'types';

export class RoomController {
  public rooms: Array<IRoom>;

  constructor(rooms: Array<IRoom>) {
    this.rooms = rooms;
  }

  addRoom(userId: string, userName: string) {
    const room = new Room();
    room.roomUsers.push({ name: userName, index: userId});

    this.rooms.push(room);
  }

  findRoom(roomId: string) {
    const room = this.rooms.find((item) => item.roomId === roomId);
    if(!room) {
      throw new Error(ErrorMessagesEnum.ROOM_DOES_NOT_EXIST);
    }

    return room;
  }

  async addUserToRoom(roomId: string, userId: string, userName: string) {
    try {
      const room = this.findRoom(roomId);

      if(!room || room.roomUsers.length === 2) {
        throw new Error(ErrorMessagesEnum.FULL_ROOM);
      }

      room.roomUsers.push({name: userName, index: userId});
    } catch (error) {
      throw new Error((error as unknown as Error).message);
    }
  }

  getRoomsWithOnePlayer() {
    const availableRooms = this.rooms.filter((room) => room.roomUsers.length === 1);

    return availableRooms;
  }

  getRooms() {
    return this.rooms;
  }
}