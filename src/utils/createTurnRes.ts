import { ClientMessageTypesEnum } from 'enums';

export const createTurnRes = (currentIndex: string, id: number) => {
  return {
    type: ClientMessageTypesEnum.TURN,
    data: JSON.stringify({ currentIndex}),
    id
  };
};