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

describe('#receiveAttack method returns if attack was sucessful', () => {
  const ship = shipFactory({
    startPos: [0, 0],
    length: 5,
    orientation: [0, 1],
  });

  test('Returns true if pos is part of it positions', () => {
    expect(ship.receiveAttack([0, 4])).toBe(true);
  });

  test('Returns false if pos is not part of positions', () => {
    expect(ship.receiveAttack([1, 5])).toBe(false);
  });
});

describe('#receiveAttack method adds the pos to attackedPositions if it was sucessful', () => {
  const ship = shipFactory({
    startPos: [0, 0],
    length: 5,
    orientation: [0, 1],
  });

  test('Adds pos to attackedPositions when succesful', () => {
    ship.receiveAttack([0, 3]);
    expect(ship.attackedPositions).toContain([0, 3]);
  });

  test('Does not add pos to attackedPositions when not sucessful', () => {
    ship.receiveAttack([1, 6]);
    expect(ship.attackedPositions).not.toContain([0, 3]);
  });
});
