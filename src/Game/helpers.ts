/* eslint-disable quotes */
import { IShip, PlayerAttackMap, ShotType } from "types";

const FIELD_SIZE = 10;

export const getSurroundingCells = (shipCells: {x: number, y: number}[], boardSize: number) => {
  const surrounding = new Set<string>();
  
  const shipCellsSet = new Set(shipCells.map(({x, y}) => `${x},${y}`));

  for (const { x, y } of shipCells) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < boardSize && 
            ny >= 0 && ny < boardSize && 
            !shipCellsSet.has(key)) {
          surrounding.add(key);
        }
      }
    }
  }
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
): {
  status: ShotType;
  playerAttackMap: PlayerAttackMap;
  missedCells: { x?: number; y?: number }[];
} => {
  const key = `${x},${y}`;
  if (previousShots.has(key)) {
    throw new Error('This position was already shot.');
  }
  previousShots.add(key);

  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    if (!ship) {continue;}

    const { length, position, direction } = ship;
    const shipCells: { x: number; y: number }[] = [];

    let isHit = false;

    for (let j = 0; j < length; j++) {
      const shipX = direction ? position.x : position.x + j;
      const shipY = direction ? position.y + j : position.y;
      shipCells.push({ x: shipX, y: shipY });

      if (shipX === x && shipY === y) {
        isHit = true;
      }
    }

    if (isHit) {
      const hits = playerAttackMap.get(i) || [];
      hits.push({ x, y });
      playerAttackMap.set(i, hits);

      const isKilled = hits.length === length;

      return {
        status: isKilled ? 'killed' : 'shot',
        playerAttackMap,
        missedCells: isKilled ? getSurroundingCells(shipCells, FIELD_SIZE) : [],
      };
    }
  }

  return {
    status: 'miss',
    playerAttackMap,
    missedCells: [],
  };
};