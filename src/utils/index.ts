import { ClientMessageTypesEnum } from 'enums';
import { RequestHandler } from 'RequestHandler/RequestHandler';
import { IAddUserData, IAttackData, IClientRequest, IRandomAttackData, IShipsData, IWSRegData } from 'types';
import { users } from 'usersDB';
export * from './parseString';
export * from './stringifyObj';

const requestHandler = new RequestHandler(users);

export const checkMessageType = async ({ type, data, id}: IClientRequest, ws: WebSocket) => {

  if(type === ClientMessageTypesEnum.REG) {
   const response = await requestHandler.handleRegRequest({ type, data, id}, ws);
   const updatedRoomResponse = await requestHandler.getUpdatedRooms();
   const { name, index, error } = response.data as unknown as IWSRegData;
   if(error) {
    return [response, updatedRoomResponse];
   }
   
   const updatedTable = await requestHandler.getUpdatedWinnersTable(index, name);
   return [response, updatedRoomResponse, updatedTable];
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
    const response = await requestHandler.makeAShoot(data as unknown as IAttackData);
    return [response];
  }

  if(type === ClientMessageTypesEnum.RANDOM_ATTACK) {
    await requestHandler.makeARandomShot(data as unknown as IRandomAttackData);
  }

};