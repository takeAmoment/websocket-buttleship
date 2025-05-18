import { ClientMessageTypesEnum } from 'enums';
import { Room } from 'Room';
import { IRoom } from 'types';

export const createUpdateRoomRes = ({rooms, id}: {rooms: Array<Room>, id: number}) => {
  const formattedRooms: Array<IRoom> = rooms.map((room) => ({roomId: room.roomId, roomUsers: room.roomUsers}));
  return {
    type: ClientMessageTypesEnum.UPDATE_ROOM,
    data: JSON.stringify(formattedRooms),
    id
  };
};