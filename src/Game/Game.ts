import { v4 as uuidv4 } from 'uuid';

import { IAttackData, IPlayer, PlayerAttackMap, IShip, ShotType, IRandomAttackData } from 'types';
import { createStartGameRes } from 'utils/createStartGameRes';
import { createTurnRes } from 'utils/createTurnRes';
import { createShotResponse } from 'utils';
import { rooms } from 'usersDB';

const FIELD_SIZE = 10;

const getSurroundingCells = (shipCells: {x: number, y: number}[], boardSize: number) => {
  const surrounding = new Set<string>();

  console.log('SHIPS cells', shipCells);
  
  const shipCellsSet = new Set(shipCells.map(({x, y}) => `${x},${y}`));

  for (const { x, y } of shipCells) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;
        console.log('KEY', key);

        if (nx >= 0 && nx < boardSize && 
            ny >= 0 && ny < boardSize && 
            !shipCellsSet.has(key)) {
          surrounding.add(key);
        }
      }
    }
  }
  console.log('Surrounding', surrounding);
  return Array.from(surrounding).map(str => {
    const [x, y] = str.split(',').map(Number);
    return { x, y };
  });
};


export const choseRandomPosition = (previousShots: Set<string>) => {
  const totalCeils = FIELD_SIZE * FIELD_SIZE;
  if(previousShots.size >=  totalCeils) {
    return null;
  }
  while (true) {
    const x = Math.floor(Math.random() * (FIELD_SIZE - 1));
    const y = Math.floor(Math.random() * (FIELD_SIZE - 1));
    const key = `${x},${y}`;

    if (!previousShots.has(key)) {
      return { x, y, previousShots };
    }
  }

};

export const checkAttackStatus = (
  x: number,
  y: number,
  ships: IShip[],
  playerAttackMap: PlayerAttackMap,
  previousShots: Set<string>
): { status: ShotType; playerAttackMap: PlayerAttackMap, missedCells: [] | {x?: number, y?: number}[]} => {
  const key = `${x},${y}`;
  const isAlreadyShooted = previousShots.has(key);

  if(isAlreadyShooted) {
    throw new Error('This position was shooted');
  }
  previousShots.add(key);
  
  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    if (ship) {
      const { length, position, direction } = ship;

      const shipCells = [];

      for (let j = 0; j < length; j++) {
        // if direction is true - vertical
        const shipX = direction ? position.x : position.x + j;
        const shipY = direction ? position.y + j : position.y;
        shipCells.push({x: shipX, y: shipY});

        if (shipX === x && shipY === y) {

          const hits = playerAttackMap.get(i) || [];
          hits.push({ x, y });
          playerAttackMap.set(i, hits);

          const isKilled = hits.length === length;
          const missedCells = isKilled ? getSurroundingCells(shipCells, FIELD_SIZE) : [];
          console.log('MISSED', missedCells);
          return {
            status: isKilled ? 'killed' : 'shot',
            playerAttackMap,
            missedCells
          };
        }
      }
    }
  }

  return { status: 'miss', playerAttackMap, missedCells: [] };
};

export class Game {
  public gameId: string;
  public player1: IPlayer | null;
  public player2: IPlayer | null;
  public player1Board: Array<IShip> | null;
  public player1AttackMap: PlayerAttackMap | null;
  public player1PreviousShots: Set<string>;
  public player2AttackMap: PlayerAttackMap | null;
  public player2PreviousShots: Set<string>;
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
    this.player1PreviousShots = new Set<string>();
    this.player2PreviousShots = new Set<string>();
  }

  private validateGameState() {
    if (!this.player1 || !this.player2) {
      throw new Error('Both players must be connected');
    }
    if (!this.player1Board || !this.player2Board) {
      throw new Error('Both players must place their ships');
    }
    if (!this.turn) {
      throw new Error('Game turn not initialized');
    }
  }

  private switchTurn() {
    if (this.turn?.index === this.player1?.index) {
      this.turn = this.player2;
    } else {
      this.turn = this.player1;
    }
    

    if (this.player1?.ws && this.player2?.ws) {
      this.sendTurn(this.player1.ws, this.turn?.index || '');
      this.sendTurn(this.player2.ws, this.turn?.index || '');
    }
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

  sendAttackRes(ws: WebSocket, currentIndex: string, x: number, y: number, status: ShotType, missedCells: [] | {x?: number, y?: number}[]) {
    const response = createShotResponse({currentPlayer: currentIndex, x, y, status, id: 0});
    console.log('MISS', missedCells);

    ws.send(JSON.stringify(response));

    missedCells?.forEach((cell) => {
      if(cell.x !== undefined && cell.y !== undefined) {
        const response = createShotResponse({currentPlayer: currentIndex, x: cell.x, y: cell.y, status: 'miss', id: 0});

        ws.send(JSON.stringify(response));
      }
    });
  }
  private checkWinCondition(playerAttackMap: PlayerAttackMap): boolean {
    let totalHits = 0;
    for (const hits of playerAttackMap.values()) {
      totalHits += hits.length;
    }
    return totalHits === 20;
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
  makeAShot(data: IAttackData) {
    this.validateGameState();
    const { x, y, indexPlayer } = data;
    if (indexPlayer !== this.turn?.index) {return;}
  
    const isPlayer1 = this.player1?.index === indexPlayer;
  
    const targetBoard = isPlayer1 ? this.player2Board : this.player1Board;
    const targetAttackMap = isPlayer1 ? this.player2AttackMap : this.player1AttackMap;
    const prevShotsBoard = isPlayer1 ? this.player1PreviousShots : this.player2PreviousShots;
    const targetWS = isPlayer1 ? this.player2?.ws : this.player1?.ws;
    const playerWS = isPlayer1 ? this.player1?.ws : this.player2?.ws;
  
    if (targetBoard && targetAttackMap && this.player1 && this.player2) {
      const { status, playerAttackMap, missedCells } = checkAttackStatus(x, y, targetBoard, targetAttackMap, prevShotsBoard);

      this.sendAttackRes(playerWS!, indexPlayer, x, y, status, missedCells);
      this.sendAttackRes(targetWS!, indexPlayer, x, y, status, missedCells);

      if (isPlayer1) {
        this.player2AttackMap = playerAttackMap;

      } else {
        this.player1AttackMap = playerAttackMap;
      }

      if (status === 'miss') {
        this.switchTurn();
      }

      if (this.checkWinCondition(playerAttackMap)) {
        const winnerWs = isPlayer1 ? this.player1?.ws : this.player2?.ws;
        const loserWs = isPlayer1 ? this.player2?.ws : this.player1?.ws;
        
        winnerWs?.send(JSON.stringify({ type: 'GAME_OVER', result: 'WIN' }));
        loserWs?.send(JSON.stringify({ type: 'GAME_OVER', result: 'LOSE' }));
        return;
      }
    }
  }

  makeARandomShot(data: IRandomAttackData) {
    const { indexPlayer, gameId } = data;

    const isPlayer1 = this.player1?.index === indexPlayer;
    const targetShotsBoard = isPlayer1 ? this.player2PreviousShots : this.player1PreviousShots;
    const randomPosition = choseRandomPosition(targetShotsBoard);
    if(!randomPosition) {
      throw new Error('Can not find random position');
    }

    const {x, y, previousShots} = randomPosition;
    if(isPlayer1) {
      this.player1PreviousShots = previousShots;
    } else {
      this.player2PreviousShots = previousShots;
    }

    this.makeAShot({ x, y, indexPlayer, gameId });
  }

}
