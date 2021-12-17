import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';

const isShipPos = (board, pos) => {
  board.ships.some((ship) => ship.isPos(pos));
};

const addClassNamesToCell = (cell, board, pos) => {
  cell.classList.add('board__cell');

  if (board.hasPosBeenAttacked(pos)) {
    cell.classList.add('board__cell--attacked');
  }

  if (isShipPos(board, pos)) {
    cell.classList.add('board__cell--ship');
  }
};

const createDOMBoard = (board) => {
  const updateBoard = (_, data) => {
    if (data !== boardDom) return;

    board.attackedPositions.forEach(([y, x]) => {
      const cellSelector = `[data ="${y}${x}"]`;
      const cell = boardDom.querySelector(cellSelector);
      cell.classList.add('board__cell--attacked');
    });

    const shipsPos = board.ships.reduce((acc, ship) => acc.concat(ship.positions), []);
    shipsPos.forEach(([y, x]) => {
      const cellSelector = `[data-pos="${y}${x}"]`;
      const cell = boardDom.querySelector(cellSelector);
      cell.classList.add('board__cell--ship');
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
