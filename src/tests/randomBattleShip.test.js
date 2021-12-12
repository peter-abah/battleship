import randomBattleShipBoard from '../randomBattleShipBoard';

describe('randomBattleShipBoard returns a valid random battleship board', () => {
  const board = randomBattleShipBoard();
  const { ships } = board;

  test('Has 5 ships', () => {
    expect(ships.length).toBe(5);
  });

  test('One of the ships has a length of 5', () => {
    const shipsWithLength5 = ships.filter((ship) => ship.length === 5);
    expect(shipsWithLength5.length).toBe(1);
  });

  test('One of the ships has a length of 4', () => {
    const shipsWithLength4 = ships.filter((ship) => ship.length === 4);
    expect(shipsWithLength4.length).toBe(1);
  });

  test('Two ships have a length of 3', () => {
    const shipsWithLength3 = ships.filter((ship) => ship.length === 3);
    expect(shipsWithLength3.length).toBe(2);
  });

  test('One of the ships has a length of 2', () => {
    const shipsWithLength2 = ships.filter((ship) => ship.length === 2);
    expect(shipsWithLength2.length).toBe(1);
  });
});