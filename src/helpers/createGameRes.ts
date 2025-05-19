import { ClientMessageTypesEnum } from 'enums';
// import { ICreateGameRes } from 'types';

export const createGameRes = ({gameId, playerId, id}: {gameId: string, playerId: string, id: number}) => {
  return {
    type: ClientMessageTypesEnum.CREATE_GAME,
    data: JSON.stringify({
      idGame: gameId,
      idPlayer: playerId,
    }),
    id
  };
};