import { ClientMessageTypesEnum } from 'enums';

export const createFinishRes = (winPlayer: string, id: number) => {
  return {
    type: ClientMessageTypesEnum.FINISH,
    id,
    data: JSON.stringify({
      winPlayer,
    }),
  };
};