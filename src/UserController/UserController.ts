import { ErrorMessagesEnum } from 'enums';
import { IUser } from 'types';

export class UserController {
  public users: Array<IUser>;

  constructor(users: Array<IUser>) {
    this.users = users;
  }

  async checkIsExisting({ name, password }: Omit<IUser, 'id'>) {
    const user = this.users.find((item) => item.name === name);
    if (!user) {
      throw new Error(ErrorMessagesEnum.USER_WAS_NOT_FOUND);
    }

    if (user.password !== password) {
      throw new Error(ErrorMessagesEnum.PASSWORD_INCORRECT);
    }

    return user;
  }
}

