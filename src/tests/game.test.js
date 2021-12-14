import gameFactory from '../game';
import playerFactory from '../playerFactory';

describe('Creating a new game with players', () => {
  test('Returns an object with start method', () => {
    const player1 = playerFactory();
    const player2 = playerFactory();
    const players = [player1, player2];
    const game = gameFactory({ players });

    expect(typeof game.start).toBe('function');
  });
});
