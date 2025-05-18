import { ClientMessageTypesEnum } from 'enums';
import { IPosition, ShotType } from 'types';

export const createShotResponse = ({ id, status, currentPlayer, x, y}: IPosition & {id: number, status: ShotType, currentPlayer: string}) => {
  return {
    type: ClientMessageTypesEnum.ATTACK,
    id,
    data: JSON.stringify({
      position: {x, y},
      currentPlayer,
      status
    }),
  };
};