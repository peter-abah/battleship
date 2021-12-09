import boardFactory from '../boardFactory';
import shipFactory from '../shipFactory';

describe('Creating a new board', () => {
  const board = boardFactory();

  test('Board has correct state', () => {
    const isStateEmpty = board.state.every((row) =>
      row.every((pos) => pos === 0)
    );

    expect(isStateEmpty).toBe(true);
  });

  test('Board has no ships', () => {
    expect(board.ships.length).toBe(0);
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
