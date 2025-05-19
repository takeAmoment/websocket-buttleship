import { IWSRegResponse, IUser } from 'types';

export const createRegResponse = ({
  type,
  data,
  id,
  isError,
  errorText,
}: Omit<IWSRegResponse, 'data'> & {
  data: IUser;
  isError: boolean;
  errorText: string;
}): IWSRegResponse => {
  return {
    type,
    id,
    data: {
      name: data.name,
      index: data.id,
      error: isError,
      errorText,
    },
  };
};
