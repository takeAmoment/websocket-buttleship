import { ClientMessageTypesEnum } from 'enums';
import { IWinData } from 'types';

export const createUpdateWinnersRes = (winData: IWinData[], id: number) => {
  return {
    type: ClientMessageTypesEnum.UPDATE_WINNERS,
    data: JSON.stringify(winData),
    id,
  };
};
