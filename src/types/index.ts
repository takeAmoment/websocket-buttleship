import { ClientMessageTypesEnum } from 'enums';

export interface IUser {
  id: string;
  name: string;
  password: string;
}

export interface IClientRequest {
  type: ClientMessageTypesEnum;
  data: Omit<IUser, 'id'>;
  id: number;
}

export interface IWSRegData {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string
}

export interface IAddUserData {
  indexRoom: string;
}
export interface IWSRegResponse {
  type: ClientMessageTypesEnum;
  data: IWSRegData | string | IAddUserData;
  id: number;
}

export interface IRoomUser {
  name: string;
  index: string;
}

export interface IRoom {
  roomId: string;
  roomUsers:  Array<IRoomUser>;
}

export interface IGameData {
  idGame: string;  
  idPlayer: string;
}

export interface ICreateGameRes {
  type: ClientMessageTypesEnum.CREATE_GAME;
  data: IGameData;
  id: number;
}

export interface IAddUserToRoomReq {
  type: ClientMessageTypesEnum.ADD_USER_TO_ROOM;
  data: IAddUserData;
  id: number;
}

export interface IUpdateRoomRes {
  type: ClientMessageTypesEnum.UPDATE_ROOM;
  data: Array<IRoom>;
  id: number;
}