import { ClientMessageTypesEnum } from 'enums';
import { IRoom } from 'types';

export const createUpdateRoomRes = ({rooms, id}: {rooms: Array<IRoom>, id: number}) => {
  return {
    type: ClientMessageTypesEnum.UPDATE_ROOM,
    data: JSON.stringify(rooms),
    id
  };
};