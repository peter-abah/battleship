import boardFactory from '../boardFactory';
import shipFactory from '../shipFactory';

describe('Creating a new board', () => {
  const board = boardFactory();

  test('Board has the correct width and height', () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(10);
  });

  test('Board has no ships', () => {
    expect(board.ships.length).toBe(0);
  });

  test('Board has empty attackedPos', () => {
    expect(board.attackedPos.length).toBe(0);
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

describe('#receiveAttack send receive attack to ship', () => {
  test('Returns true if ship is attacked', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 3,
      orientation: [0, 1],
    });
    const board = boardFactory({ ships: [ship] });
    expect(board.receiveAttack([0, 2])).toBe(true);
  });

  test('Returns false if ship is not attacked', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 3,
      orientation: [0, 1],
    });
    const board = boardFactory({ ships: [ship] });
    expect(board.receiveAttack([1, 2])).toBe(false);
  });

  test('Records the attack in attackedPos', () => {
    const board = boardFactory();
    const pos = [1, 2];
    board.receiveAttack(pos);

    expect(board.attackedPos).toContainEqual([1, 2]);
  });

  test('Send receiveAttack message to ship when attacked', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 3,
      orientation: [0, 1],
    });
    const board = boardFactory({ ships: [ship] });
    const pos = [0, 2];

    const spy = jest.spyOn(ship, 'receiveAttack');
    board.receiveAttack(pos);
    expect(spy).toHaveBeenCalledWith(pos);
    spy.mockRestore();
  });
});

describe('receiveAttack method throws error if pos is invalid', () => {
  test('throws error if pos is out of bounds', () => {
    const board = boardFactory();
    expect(() => board.receiveAttack([10, 5])).toThrowError();
  });

  test('throws error if pos has been attacked before', () => {
    const board = boardFactory();
    board.receiveAttack([3, 5]);
    expect(() => board.receiveAttack([3, 5])).toThrowError();
  });
});

describe('#addShip adds a ship to board', () => {
  test('Returns true if a ship is added', () => {
    const board = boardFactory();
    const ship = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });
    expect(board.addShip(ship)).toBe(true);
  });

  test('Adds the ship to board ships', () => {
    const board = boardFactory();
    const ship = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });
    board.addShip(ship);
    expect(board.ships).toContain(ship);
  });

  test('Returns false if ship positions is overlapping', () => {
    const ship1 = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });
    const ship2 = shipFactory({
      startPos: [0, 1],
      length: 2,
      orientation: [0, 1],
    });
    const board = boardFactory({ ships: [ship1] });
    expect(board.addShip(ship2)).toBe(false);
  });

  test('Returns false if ship positions is out of bounds', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 12,
      orientation: [0, 1],
    });
    const board = boardFactory();
    expect(board.addShip(ship)).toBe(false);
  });

  test('Does not add ship to board if ship positions is overlapping', () => {
    const ship1 = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });
    const ship2 = shipFactory({
      startPos: [0, 1],
      length: 2,
      orientation: [0, 1],
    });
    const board = boardFactory({ ships: [ship1] });
    board.addShip(ship2);

    expect(board.ships).not.toContain(ship2);
  });

  test('Does not add ship to board if ship positions is out of bounds', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 12,
      orientation: [0, 1],
    });
    const board = boardFactory();
    board.addShip(ship);
    expect(board.ships).not.toContain(ship);
  });
});
