import { ClientMessageTypesEnum } from 'enums';
import { ICreateGameRes } from 'types';

export const createGameRes = ({gameId, playerId, id}: {gameId: string, playerId: string, id: number}): ICreateGameRes => {
  return {
    type: ClientMessageTypesEnum.CREATE_GAME,
    data: {
      idGame: gameId,
      idPlayer: playerId,
    },
    id
  };
};