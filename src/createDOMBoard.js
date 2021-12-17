const isShipPos = (board, pos) => {
  board.ships.some((ship) => ship.isPos(pos));
};

const addClassNamesToCell = (cell, board, pos) => {
  cell.classList.add('board__cell');

  if (board.isPosAtttacked(pos)) {
    cell.classList.add('board__cell--attacked');
  }

  if (isShipPos(board, pos)) {
    cell.classList.add('board__cell--ship');
  }
};

const createDOMBoard = (board) => {
  const boardDom = document.createElement('div');
  boardDom.className = 'board';

  board.allIndices.forEach(([y, x]) => {
    const cell = document.createElement('div');
    addClassNamesToCell(cell, board, [y, x]);
    cell.dataset.pos = `${y}${x}`;
    boardDom.appendChild(cell);
  });

  return board;
};

export default createDOMBoard;
