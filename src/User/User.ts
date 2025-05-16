import { IUser } from 'types';
import { v4 as uuidv4 } from 'uuid';

export class User implements IUser {
  public id: string;
  public name: string;
  public password: string;

  constructor(name: string, password: string) {
    this.id = uuidv4();
    this.name = name;
    this.password = password;
  }
}