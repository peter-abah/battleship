import boardFactory from '../boardFactory';
import shipFactory from '../shipFactory';

const isBoardStateEmpty = (board) => {
  for(let y = 0; y < board.height; y += 1) {
    for(let x = 0; x < board.width; x += 1) {
      const square = board.square_at({ x, y});
      if (square) return false;
    }
  }
  return true;
};

describe('Creating a new board', () => {
  const board = boardFactory();

  test('Board has the correct width and height', () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(10)
  });

  test('Board has no ships', () => {
    expect(board.ships.length).toBe(0);
  });

  test('Board has correct state', () => {
    const isStateEmpty = board.state.every((row) =>
      row.every((pos) => pos === false)
    );

    expect(isBoardStateEmpty(board)).toBe(true);
  });
});

describe('Creating a new board with ships', () => {
  test('ships property contains ships passed to board', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });

    const board = boardFactory({ ships: [ship] });

    expect(board.ships).toContain(ship);
  });

  test('ships contains no ships if it passed any ship', () => {
    const board = boardFactory();
    expect(board.ships.length).toBe(0);
  });
});

describe('Validates ship positions are not overlapping', () => {
  test('throws error if ships overlap', () => {
    const ship1 = shipFactory({
      startPos: [0, 0],
      length: 4,
      orientation: [0, 1],
    });

    const ship2 = shipFactory({
      startPos: [0, 4],
      length: 3,
      orientation: [0, -1],
    });

    expect(() => boardFactory({ ships: [ship1, ship2] })).toThrowError();
  });
});

describe('Validates ship positions are not outside board', () => {
  test('throws error if ship is outside board', () => {
    const ship1 = shipFactory({
      startPos: [0, 0],
      length: 4,
      orientation: [0, -1],
    });
    expect(() => boardFactory({ ships: [ship1] })).toThrowError();
  });
});

describe('#square_at returns the state of the square if it is attacked', () => {
  test('Returns the correct square state', () => {
    const board = boardFactory();
    expect(board.square_at({ x: 0, y: 0 })).toBe(false);
  });
});
