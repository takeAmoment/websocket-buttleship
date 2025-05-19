import { ClientMessageTypesEnum } from 'enums';
import { IShip } from 'types';

export const createStartGameRes = ({
  ships,
  id,
  playerIndex,
}: {
  ships: Array<IShip>;
  id: number;
  playerIndex: string;
}) => {
  return {
    type: ClientMessageTypesEnum.START_GAME,
    id,
    data: JSON.stringify({ ships, currentPlayerIndex: playerIndex }),
  };
};
