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

  test('Board has empty attackedPositionsitions', () => {
    expect(board.attackedPositions.length).toBe(0);
  });

  test('Board has the correct indices', () => {
    const boardIndices = board.allIndices.map((index) =>
      Number(index.toString().replace(/,/g, ''))
    );

    const expectedIndices = [...Array(100).keys()];
    expect(boardIndices).toEqual(expectedIndices);
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

  test('Records the attack in attackedPositions', () => {
    const board = boardFactory();
    const pos = [1, 2];
    board.receiveAttack(pos);

    expect(board.attackedPositions).toContainEqual([1, 2]);
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

describe('#sunkShips method returns ships that have been sunk', () => {
  test('Returns empty array when no ships have been sunk', () => {
    const board = boardFactory();
    expect(board.sunkShips()).toEqual([]);
  });

  test('Returns empty array when ship is attacked but not sunk', () => {
    const ship1 = shipFactory({ length: 2 });
    const board = boardFactory({ ships: [ship1] });

    board.receiveAttack([0, 0]);
    expect(board.sunkShips()).toEqual([]);
  });

  test('Returns the ship(s) that have been sunk', () => {
    const ship = shipFactory();
    const board = boardFactory({ ships: [ship] });

    board.receiveAttack([0, 0]);
    expect(board.sunkShips()).toContain(ship);
  });
});

describe('#isAttackValid returns if a an attack is valid', () => {
  const board = boardFactory();

  test('returns false if attack is out of bounds', () => {
    expect(board.isAttackValid([10, 10])).toBe(false);
  });

  test('Returns true if attack is in bounds', () => {
    expect(board.isAttackValid([5, 5])).toBe(true);
  });

  test('Returns false is the pos has been attacked', () => {
    const board = boardFactory();
    board.receiveAttack([0, 0]);
    expect(board.isAttackValid([0, 0])).toBe(false);
  });
});

describe('#isAllShipSunk method returns if all ships have been sunk', () => {
  test('Returns false if no ship is sunk', () => {
    const ship1 = shipFactory({ startPos: [0, 1] });
    const ship2 = shipFactory({ startPos: [0, 2] });
    const board = boardFactory({ ships: [ship1, ship2] });

    expect(board.isAllShipsSunk()).toBe(false);
  });

  test('Returns false if one ship is sunk', () => {
    const ship1 = shipFactory({ startPos: [0, 1] });
    const ship2 = shipFactory({ startPos: [0, 2] });
    const board = boardFactory({ ships: [ship1, ship2] });

    board.receiveAttack([0, 2]);
    expect(board.isAllShipsSunk()).toBe(false);
  });

  test('Returns true if all ships are sunk', () => {
    const ship1 = shipFactory({ startPos: [0, 1] });
    const ship2 = shipFactory({ startPos: [0, 2] });
    const board = boardFactory({ ships: [ship1, ship2] });

    board.receiveAttack([0, 1]);
    board.receiveAttack([0, 2]);

    expect(board.isAllShipsSunk()).toBe(true);
  });
});

describe('#canShipBeAdded returns if ship can be added to board', () => {
  test('Returns true if ship can be added', () => {
    const board = boardFactory();
    const ship = shipFactory();

    expect(board.canShipBeAdded(ship)).toBe(true);
  });

  test('Returns false if ship position is outside board', () => {
    const board = boardFactory();
    const ship = shipFactory({ startPos: [10, 10] });

    expect(board.canShipBeAdded(ship)).toBe(false);
  });

  test('Returns false if ship position overlaps a ship in the board', () => {
    const ship1 = shipFactory();
    const ship2 = shipFactory();
    const board = boardFactory({ ships: [ship1] });

    expect(board.canShipBeAdded(ship2)).toBe(false);
  });
});

describe('#forOpponent returns board without important properties', () => {
  const board = boardFactory();
  const boardForOpponent = board.forOpponent();

  test('ships property is empty', () => {
    expect(boardForOpponent.ships.length).toBe(0);
  });

  test('It does not have receiveAttack method', () => {
    expect(boardForOpponent.receiveAttack).toBe(undefined);
  });

  test('It does not have addShip method', () => {
    expect(boardForOpponent.addShip).toBe(undefined);
  });
});

describe('#isAllPositionsAttacked returns if all positions has been attacked', () => {
  test('Returns false for new board', () => {
    const board = boardFactory();
    expect(board.isAllPositionsAttacked()).toBe(false);
  });

  test('Returns false for board with few positons attacked', () => {
    const board = boardFactory();

    // Attack 10 board positions
    board.allIndices.slice(0, 10).forEach((pos) => board.receiveAttack(pos));
    expect(board.isAllPositionsAttacked()).toBe(false)
  });

  test('Returns true if all positions have been attacked', () => {
    const board = boardFactory();

    // Attack all board positions
    board.allIndices.forEach((pos) => board.receiveAttack(pos));
    expect(board.isAllPositionsAttacked()).toBe(true);
  });
});

describe('#hasPosBeenAttacked returns if pos has been attacked', () => {
  test('Returns false if pos has not been attacked', () => {
    const board = boardFactory();
    expect(board.hasPosBeenAttacked([0 , 0])).toBe(false);
  });

  test('Returns true if pos has been attacked', () => {
    const board = boardFactory();

    board.receiveAttack([0 , 0]);
    expect(board.hasPosBeenAttacked([0, 0])).toBe(true);
  });
});
