import { ClientMessageTypesEnum } from 'enums';
import { RequestHandler } from 'RequestHandler/RequestHandler';
import { IAddUserData, IAttackData, IClientRequest, IRandomAttackData, IShipsData, IUser, IWSRegResponse } from 'types';
import { users } from 'usersDB';
export * from './parseString';
export * from './stringifyObj';
export * from './createGameRes';
export * from './createUpdateRoomRes';
export * from './createShotResponse';

export const createRegResponse = ({ type, data, id, isError, errorText}: Omit<IWSRegResponse, 'data'> & {data: IUser, isError: boolean, errorText: string }): IWSRegResponse => {
  return {
    type,
    id,
    data: {
      name: data.name,
      index: data.id,
      error: isError,
      errorText
    }
  };
};
const requestHandler = new RequestHandler(users);

export const checkMessageType = async ({ type, data, id}: IClientRequest, ws: WebSocket) => {


  if(type === ClientMessageTypesEnum.REG) {
   const response = await requestHandler.handleRegRequest({ type, data, id});
   const updatedRoomResponse = await requestHandler.getUpdatedRooms();
   return [response, updatedRoomResponse];
  }

  if(type === ClientMessageTypesEnum.CREATE_ROOM) {
   const response = await requestHandler.createRoom(ws);
   const updatedRoomResponse = await requestHandler.getUpdatedRooms();
   return [response, updatedRoomResponse];
  }

  if(type === ClientMessageTypesEnum.ADD_USER_TO_ROOM) {
    const { indexRoom } = data as unknown as IAddUserData;
    const createdGameRes = await requestHandler.updateRoom(indexRoom, ws);
    const updatedRoomResponse = await requestHandler.getUpdatedRooms();
    return [createdGameRes, updatedRoomResponse];
  }

  if(type === ClientMessageTypesEnum.ADD_SHIPS) {
    await requestHandler.addGameData(data as unknown as IShipsData); 
  }

  if(type === ClientMessageTypesEnum.ATTACK) {
    await requestHandler.makeAShoot(data as unknown as IAttackData);
  }

  if(type === ClientMessageTypesEnum.RANDOM_ATTACK) {
    await requestHandler.makeARandomShot(data as unknown as IRandomAttackData);
  }

};