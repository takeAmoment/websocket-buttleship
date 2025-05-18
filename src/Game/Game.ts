import { v4 as uuidv4 } from 'uuid';

import { IAttackData, IPlayer, PlayerAttackMap, IShip, ShotType } from 'types';
import { createStartGameRes } from 'utils/createStartGameRes';
import { createTurnRes } from 'utils/createTurnRes';
import { createShotResponse } from 'utils';
import { rooms } from 'usersDB';

export const checkAttackStatus = (
  x: number,
  y: number,
  ships: IShip[],
  playerAttackMap: PlayerAttackMap
): { status: ShotType; playerAttackMap: PlayerAttackMap } => {
  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    if (ship) {
      const { length, position, direction } = ship;

      for (let j = 0; j < length; j++) {
        // if direction is true - vertical
        const shipX = direction ? position.x : position.x + j;
        const shipY = direction ? position.y + j : position.y;

        if (shipX === x && shipY === y) {

          const hits = playerAttackMap.get(i) || [];
          hits.push({ x, y });
          playerAttackMap.set(i, hits);

          const isKilled = hits.length === length;
          return {
            status: isKilled ? 'killed' : 'shot',
            playerAttackMap
          };
        }
      }
    }
  }

  return { status: 'miss', playerAttackMap };
};

export class Game {
  public gameId: string;
  public player1: IPlayer | null;
  public player2: IPlayer | null;
  public player1Board: Array<IShip> | null;
  public player1AttackMap: PlayerAttackMap | null;
  public player2AttackMap: PlayerAttackMap | null;
  public player2Board: Array<IShip> | null;
  public turn: IPlayer | null;

  constructor() {
    this.gameId = uuidv4();
    this.player1 = null;
    this.player2 = null;
    this.player1Board = null;
    this.player2Board = null;
    this.turn = null;
    this.player1AttackMap = new Map();
    this.player2AttackMap = new Map();
  }

  sendTurn(ws: WebSocket, currentIndex: string) {
    const response = createTurnRes(currentIndex, 0);
    ws.send(JSON.stringify({ type: this.turn?.index}));
    ws.send(JSON.stringify({ type: response.data}));
    ws.send(JSON.stringify(response));
  }

  startGame(
    ws: WebSocket,
    ships: Array<IShip>,
    id: number,
    playerIndex: string
  ) {
    const response = createStartGameRes({ ships, id, playerIndex });

    ws.send(JSON.stringify(response));
  }

  sendAttackRes(ws: WebSocket, currentIndex: string, x: number, y: number, status: ShotType) {
    const response = createShotResponse({currentPlayer: currentIndex, x, y, status, id: 0});

    ws.send(JSON.stringify(response));
  }

  checkIsGameStarted() {
    if (
      this.player1 &&
      this.player2 &&
      this.player1Board &&
      this.player2Board &&
      this.turn
    ) {
      this.player1.ws.send(JSON.stringify({ type: 'SENDDD' }));
      this.player2.ws.send(JSON.stringify({ type: 'PLAYER2' }));
      this.startGame(this.player1.ws, this.player1Board, 0, this.player1.index);
      this.startGame(this.player2.ws, this.player2Board, 0, this.player2.index);

      this.sendTurn(this.player1.ws, this.player1.index);
      this.sendTurn(this.player2.ws, this.player1.index);
      // this.sendTurn(this.player2.ws, this.turn?.index);
      // this.player1.ws.send(JSON.stringify({type: ClientMessageTypesEnum.START_GAME, id: 0, data: JSON.stringify({ ships: this.player1Board, currentPlayerIndex: this.player1.index })}));
      // this.player2.ws.send(JSON.stringify({type: ClientMessageTypesEnum.START_GAME, id: 0, data: JSON.stringify({ ships: this.player2Board, currentPlayerIndex: this.player2.index })}));
      // console.log('START GAME', this.player1, this.player2);
    }
  }

  setPlayer1(user: IPlayer) {
    this.player1 = user;
    this.turn = user;
    console.log('PLAYER1', user, rooms);
  }

  setPlayer2(user: IPlayer) {
    this.player2 = user;
    console.log('PLAYER2', user, rooms);
  }

  setPlayer1Board(data: Array<IShip>) {
    this.player1Board = data;
    this.checkIsGameStarted();
  }

  setPlayer2Board(data: Array<IShip>) {
    this.player2Board = data;
    this.checkIsGameStarted();
  }

  makeAShoot(data: IAttackData) {
    const { x, y, indexPlayer } = data;

    const targetBoard =
      this.player1?.index === indexPlayer ? this.player2Board : this.player1Board;

    const targetAttackMap =
      this.player1?.index === indexPlayer ? this.player1AttackMap : this.player2AttackMap;

    if(targetBoard && targetAttackMap && this.player1 && this.player2) {
      const { status, playerAttackMap } = checkAttackStatus(x, y, targetBoard, targetAttackMap);

      this.sendAttackRes(this.player2.ws, indexPlayer, x, y, status);

      this.sendAttackRes(this.player1.ws, indexPlayer, x, y, status);

      if(this.player1?.index === indexPlayer) {
        this.player1AttackMap = playerAttackMap;
  
        if(status === 'miss') {
          this.turn = this.player2;
          this.sendTurn(this.player1.ws, this.player2.index);
          this.sendTurn(this.player2.ws, this.player2.index);
        }
      }else {
        this.player2AttackMap = playerAttackMap;
    
        if(status === 'miss') {
          this.turn = this.player1;
          this.sendTurn(this.player1.ws, this.player1.index);
          this.sendTurn(this.player2.ws, this.player1.index);
        }
      }
    
    }

  }

}
