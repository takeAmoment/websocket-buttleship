import { Room } from 'Room';
import { IUser, IWinData } from 'types';

export const users: Array<IUser> = [];

export const rooms: Array<Room> = [];

export const socketsUser = new Map<WebSocket, string>();

export const winnersTable = new Map<string, IWinData>();
