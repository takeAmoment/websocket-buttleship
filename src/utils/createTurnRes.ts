import { ClientMessageTypesEnum } from 'enums';

export const createTurnRes = (currentPlayer: string, id: number) => {
  return {
    type: ClientMessageTypesEnum.TURN,
    data: JSON.stringify({ currentPlayer}),
    id
  };
};