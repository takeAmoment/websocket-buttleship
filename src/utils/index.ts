import { ClientMessageTypesEnum } from 'enums';
import { RequestHandler } from 'RequestHandler/RequestHandler';
import { IClientRequest, IUser, IWSRegResponse } from 'types';
import { users } from 'usersDB';
export * from './parseString';
export * from './stringifyObj';

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

export const checkMessageType = async ({ type, data, id}: IClientRequest) => {
  const requestHandler = new RequestHandler(users);

  if(type === ClientMessageTypesEnum.REG) {
   const response = await requestHandler.handleRegRequest({ type, data, id});
   return response;
  }

};