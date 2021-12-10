import shipFactory from '../shipFactory';
import playerFactory from '../playerFactory';

describe('Creating a player with ships', () => {
  test('Returns an object containing a board containing the ships', () => {
    const ship1 = shipFactory({
      startPos: [0, 0],
      length: 2,
      orientation: [0, 1],
    });
    const ship2 = shipFactory({
      startPos: [4, 0],
      length: 2,
      orientation: [0, 1],
    });
    const player = playerFactory({ ships: [ship1, ship2] });
    const playerBoard = player.board;
    expect(playerBoard.ships).toContain(ship1, ship2)
  });
});
