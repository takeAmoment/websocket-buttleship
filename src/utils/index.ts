import { ClientMessageTypesEnum } from 'enums';
import { RequestHandler } from 'RequestHandler/RequestHandler';
import { IClientRequest, IUser, IWSRegResponse } from 'types';
import { users } from 'usersDB';
export * from './parseString';
export * from './stringifyObj';
export * from './createGameRes';
export * from './createUpdateRoomRes';

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

export const checkMessageType = async ({ type, data, id}: IClientRequest) => {


  if(type === ClientMessageTypesEnum.REG) {
   const response = await requestHandler.handleRegRequest({ type, data, id});
   return [response];
  }

  if(type === ClientMessageTypesEnum.CREATE_ROOM) {
   const response = await requestHandler.createRoom();
   const updatedRoomResponse = await requestHandler.updateRoom();
   console.log('Updated', updatedRoomResponse);
   return [response, updatedRoomResponse];
  }

  if(type === ClientMessageTypesEnum.ADD_USER_TO_ROOM) {
    console.log('AAAADDDDDDDDD');
  }

};