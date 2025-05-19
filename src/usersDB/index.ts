import { Room } from 'Room';
import { IUser } from 'types';
import { User } from 'User/User';

export const users: Array<IUser> = [];
users.push(new User('admin', 'admin'));
users.push(new User('newAdmin', 'newAdmin'));

export const rooms: Array<Room> = [];

export const socketsUser = new Map<WebSocket, string>();