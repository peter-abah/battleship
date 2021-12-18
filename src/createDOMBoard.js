import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';

const isShipPos = (board, pos) => board.ships.some((ship) => ship.isPos(pos));

const isSunkShipPos = (board, pos) =>
  board.sunkShips().some((ship) => ship.isPos(pos));

const isAttackedShipPos = (board, [y, x]) =>
  board.attackedShipsPositions.some((pos) => pos[0] === y && pos[1] === x);

const addClassNamesToCell = (cell, board, pos) => {
  cell.classList.add('board__cell');

  if (board.hasPosBeenAttacked(pos)) {
    cell.classList.add('board__cell--attacked');
  }

  if (isShipPos(board, pos)) {
    cell.classList.add('board__cell--ship');
  }

  if (isAttackedShipPos(board, pos)) {
    cell.classList.add('board__cell--attacked-ship');
  }

  if (isSunkShipPos(board, pos)) {
    cell.classList.add('board__cell--sunk-ship');
  }
};

const createDOMBoard = (board) => {
  const getCell = ([y, x]) => {
    const cellSelector = `[data-pos="${y}${x}"]`;
    return boardDom.querySelector(cellSelector);
  };
  
  const updateBoard = (_, data) => {
    if (data !== boardDom) return;

    board.attackedPositions.forEach((pos) => {
      const cell = getCell(pos);
      cell.classList.add('board__cell--attacked');
    });

    const shipsPos = board.ships.reduce(
      (acc, ship) => acc.concat(ship.positions),
      []
    );
    shipsPos.forEach((pos) => {
      const cell = getCell(pos);
      cell.classList.add('board__cell--ship');
    });

    const sunkShipsPos = board
      .sunkShips()
      .reduce((acc, ship) => acc.concat(ship.positions), []);

    sunkShipsPos.forEach((pos) => {
      const cell = getCell(pos);
      cell.classList.add('board__cell--sunk-ship');
    });

    board.attackedShipsPositions.forEach((pos) => {
      const cell = getCell(pos);
      cell.classList.add('board__cell--attacked-ship');
    });
  };

  const boardDom = document.createElement('div');
  boardDom.className = 'board';

  board.allIndices.forEach(([y, x]) => {
    const cell = document.createElement('button');
    cell.id = `cell${y}${x}`;
    addClassNamesToCell(cell, board, [y, x]);
    cell.dataset.pos = `${y}${x}`;
    boardDom.appendChild(cell);
  });

  PubSub.subscribe(eventTypes.UPDATE_BOARD, updateBoard);
  return boardDom;
};

export default createDOMBoard;
