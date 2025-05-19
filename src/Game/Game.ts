import { v4 as uuidv4 } from 'uuid';
import { IAttackData, IPlayer, PlayerAttackMap, IShip, ShotType, IRandomAttackData } from 'types';
import { createStartGameRes } from 'helpers/createStartGameRes';
import { createTurnRes } from 'helpers/createTurnRes';
import { createFinishRes, createShotResponse, createUpdateWinnersRes } from 'helpers';
import { checkAttackStatus, choseRandomPosition } from './helpers';
import { winnersTable } from 'usersDB';

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

    ws.send(JSON.stringify(response));

    missedCells?.forEach((cell) => {
      if(cell.x !== undefined && cell.y !== undefined) {
        const response = createShotResponse({currentPlayer: currentIndex, x: cell.x, y: cell.y, status: 'miss', id: 0});

        ws.send(JSON.stringify(response));
      }
    });
  }

  checkWinCondition(playerAttackMap: PlayerAttackMap): boolean {
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
   
      this.startGame(this.player1.ws, this.player1Board, 0, this.player1.index);
      this.startGame(this.player2.ws, this.player2Board, 0, this.player2.index);

      this.sendTurn(this.player1.ws, this.player1.index);
      this.sendTurn(this.player2.ws, this.player1.index);
    }
  }

  setPlayer1(user: IPlayer) {
    this.player1 = user;
    this.turn = user;
  }

  setPlayer2(user: IPlayer) {
    this.player2 = user;
  }

  setPlayer1Board(data: Array<IShip>) {
    this.player1Board = data;
    this.checkIsGameStarted();
  }

  setPlayer2Board(data: Array<IShip>) {
    this.player2Board = data;
    this.checkIsGameStarted();
  }

  finishGame(winner: IPlayer, loser: IPlayer) {
    const result = createFinishRes(winner.index || '', 0);
    const winnerData = winnersTable.get(winner?.index)?.wins || 0;
    const updateData = winnerData + 1;
    winnersTable.set(winner?.index, { name: winner?.name, wins: updateData });
    
    winner?.ws.send(JSON.stringify(result));
    loser?.ws.send(JSON.stringify(result));

    const winners = Array.from(winnersTable.values());
    const updatedTable = createUpdateWinnersRes(winners,  0);

    return {isFinished: true, updatedTable};
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

      if (this.checkWinCondition(playerAttackMap)) {
        const winner = isPlayer1 ? this.player1 : this.player2;
        const loser = isPlayer1 ? this.player2 : this.player1;
        return this.finishGame(winner!, loser!);
      }

      if (status === 'miss') {
        this.switchTurn();
      } else {
        this.sendTurn(this.player1.ws, this.turn?.index || '');
        this.sendTurn(this.player2.ws, this.turn?.index || '');
      }
    }

    return { isFinished: false, updatedTable: null };
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

    return this.makeAShot({ x, y, indexPlayer, gameId });
  }

}
