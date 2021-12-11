import shipFactory from '../shipFactory';

describe('Creating a new ship', () => {
  const ship = shipFactory({
    startPos: [0, 0],
    length: 5,
    orientation: [0, 1],
  });

  test('The ship has the correct start pos', () => {
    expect(ship.startPos).toEqual([0, 0]);
  });

  test('The ship has the correct length', () => {
    expect(ship.length).toEqual(5);
  });

  test('The ship has the correct orientation', () => {
    expect(ship.orientation).toEqual([0, 1]);
  });
});

describe('Creating a new ship with no arguments', () => {
  const ship = shipFactory();

  test('The ship has the default start pos', () => {
    expect(ship.startPos).toEqual([0, 0]);
  });

  test('The ship has the default length', () => {
    expect(ship.length).toEqual(1);
  });

  test('The ship has the default orientation', () => {
    expect(ship.orientation).toEqual([0, 1]);
  });
});

describe('#positions method returns the correct positions of ship', () => {
  test('Returns the correct positions of the ship when orientation is down vertical', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 4,
      orientation: [0, 1],
    });
    const expectedPositions = [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ];
    expect(ship.positions).toEqual(expectedPositions);
  });

  test('Returns the correct positions of the ship when orientation is up vertical', () => {
    const ship = shipFactory({
      startPos: [0, 9],
      length: 4,
      orientation: [0, -1],
    });
    const expectedPositions = [
      [0, 9],
      [0, 8],
      [0, 7],
      [0, 6],
    ];
    expect(ship.positions).toEqual(expectedPositions);
  });

  test('Returns the correct positions of the ship when orientation is left horizontal', () => {
    const ship = shipFactory({
      startPos: [5, 0],
      length: 4,
      orientation: [-1, 0],
    });
    const expectedPositions = [
      [5, 0],
      [4, 0],
      [3, 0],
      [2, 0],
    ];
    expect(ship.positions).toEqual(expectedPositions);
  });

  test('Returns the correct positions of the ship when orientation is right horizontal', () => {
    const ship = shipFactory({
      startPos: [5, 0],
      length: 4,
      orientation: [1, 0],
    });
    const expectedPositions = [
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
    ];
    expect(ship.positions).toEqual(expectedPositions);
  });
});

describe('#isPos method indicates if a pos is part of ship positions', () => {
  const ship = shipFactory({
    startPos: [1, 1],
    length: 4,
    orientation: [0, 1]
  })

  test('Returns true if pos is part of ship positions', () => {
    expect(ship.isPos([1, 3])).toBe(true)
  });

  test('Returns false if pos is not part of ship positions', () => {
    expect(ship.isPos([2, 3])).toBe(false)
  });
});

describe('#receiveAttack method returns if attack was sucessful', () => {
  test('Returns true if pos is part of it positions', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 5,
      orientation: [0, 1],
    });

    expect(ship.receiveAttack([0, 4])).toBe(true);
  });

  test('Returns false if pos is not part of positions', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 5,
      orientation: [0, 1],
    });

    expect(ship.receiveAttack([1, 5])).toBe(false);
  });
});

describe('#receiveAttack method adds the pos to attackedPositions if it was sucessful', () => {
  test('Adds pos to attackedPositions when succesful', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 5,
      orientation: [0, 1],
    });

    ship.receiveAttack([0, 3]);
    const shipContainsPos = ship.attackedPositions.some((e) => e[0] === 0 && e[1] === 3);
    expect(shipContainsPos).toBe(true);
  });

  test('Does not add pos to attackedPositions when not sucessful', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 5,
      orientation: [0, 1],
    });

    ship.receiveAttack([1, 6]);
    const shipContainsPos = ship.attackedPositions.some((e) => e[0] === 1 && e[1] === 6);
    expect(shipContainsPos).toBe(false);
  });
});

describe('#isSunk method returns if all it positions has been attacked', () => {
  test('Returns false if it has not been sunk', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 3,
      orientation: [0, 1],
    });

    // Attacks only one of it pos
    ship.receiveAttack([0, 0]);

    expect(ship.isSunk()).toBe(false);
  });

  test('Returns true if it has been sunk', () => {
    const ship = shipFactory({
      startPos: [0, 0],
      length: 3,
      orientation: [0, 1],
    });

    // Attacks the ship
    ship.receiveAttack([0, 0]);
    ship.receiveAttack([0, 1]);
    ship.receiveAttack([0, 2]);

    expect(ship.isSunk()).toBe(true);
  });
});
