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

export interface IWSRegResponse {
  type: ClientMessageTypesEnum;
  data: IWSRegData;
  id: number;
}