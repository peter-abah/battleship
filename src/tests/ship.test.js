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
