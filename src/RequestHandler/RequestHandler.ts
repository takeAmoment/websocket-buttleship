import { IClientRequest, IUser } from 'types';
import { UserController } from 'UserController/UserController';
import { createRegResponse } from 'utils';

export class RequestHandler {
  public userController: UserController;

  constructor(users: Array<IUser>) {
    this.userController = new UserController(users);
  }

  async handleRegRequest({ type, data, id}: IClientRequest) {
    const { name, password} = data;
    try {
      const result = await this.userController.checkIsExisting(data);
      return createRegResponse({ data: result, type, id, isError: false, errorText: ''});
    } catch (error) {
      const isError = true;
      const errorMessage = (error as unknown as Error).message;
      return createRegResponse({ data: {name, password, id: ''}, type, id, isError, errorText: errorMessage});
    }
  }
}