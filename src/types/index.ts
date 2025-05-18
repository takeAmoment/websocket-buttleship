import { ClientMessageTypesEnum } from 'enums';

export interface IUser {
  id: string;
  name: string;
  password: string;
}

export interface IPlayer {
  index: string;
  name: string;
  ws: WebSocket;
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

export type ShipType = 'small'|'medium'|'large'|'huge';

export interface IShip {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;

}

export interface IShipsData {
  gameId: string;
  ships: Array<IShip>;
  indexPlayer: string;
}

export interface IAddShipsReq {
  type: ClientMessageTypesEnum.ADD_SHIPS;
  data: IShipsData;
  id: number;
}

export interface IStartGameData {
  ships: Array<IShip>;
  currentPlayerIndex: string;
}

export interface IStartGameRes {
  type:ClientMessageTypesEnum.START_GAME;
  data: IStartGameData;
  id: number;
}

export interface ITurnRes {
  type: ClientMessageTypesEnum.TURN;
  data: { currentPlayer: string};
  id: number;
}

export interface IAttackData {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
}

export type ShotType =  'miss'|'killed'|'shot';

export interface IAttackResData {
  position: { x: number, y: number};
  currentPlayer: string;
  status: ShotType;
}

export interface IAttackReq {
  type: ClientMessageTypesEnum.ATTACK;
  data: IAttackData;
  id: number
}

export interface IAttackRes {
  type: ClientMessageTypesEnum.ATTACK;
  data: IAttackResData;
  id: number;
}

export interface IPosition {
  x: number;
  y: number;
}

export type PlayerAttackMap = Map<number, Array<IPosition>>;
export interface IRandomAttackData {
  gameId: string;
  indexPlayer: string;
}
export interface IRandomAttackReq {
  type: ClientMessageTypesEnum.RANDOM_ATTACK;
  data: IRandomAttackData;
  id: number;
}