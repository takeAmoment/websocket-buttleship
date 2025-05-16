import { IUser } from 'types';
import { User } from 'User/User';

export const users: Array<IUser> = [];
users.push(new User('admin', 'admin'));