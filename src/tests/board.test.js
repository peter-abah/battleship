import boardFactory from '../boardFactory';

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
