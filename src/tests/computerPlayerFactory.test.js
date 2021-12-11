import PubSub from 'pubsub-js';
import eventTypes from '../eventTypes';
import boardFactory from '../boardFactory';
import computerPlayerFactory from '../computerPlayerFactory';

describe('Creating a new computer player', () => {
  const computerPlayer = computerPlayerFactory();
  const computerPlayerShips = computerPlayer.board.ships;

  test('Returns an object with board which has 5 ships', () => {
    expect(computerPlayerShips.length).toBe(5);
  });

  test('One of the ships has a length of 5', () => {
    const shipsWithLength5 = computerPlayerShips.filter(
      (ship) => ship.length === 5
    );
    expect(shipsWithLength5.length).toBe(1);
  });

  test('One of the ships has a length of 4', () => {
    const shipsWithLength4 = computerPlayerShips.filter(
      (ship) => ship.length === 4
    );
    expect(shipsWithLength4.length).toBe(1);
  });

  test('Two ships have a length of 3', () => {
    const shipsWithLength3 = computerPlayerShips.filter(
      (ship) => ship.length === 3
    );
    expect(shipsWithLength3.length).toBe(2);
  });

  test('One of the ships has a length of 2', () => {
    const shipsWithLength2 = computerPlayerShips.filter(
      (ship) => ship.length === 2
    );
    expect(shipsWithLength2.length).toBe(1);
  });
});

describe('Sends a PLAYER_MOVE in response to NEXT_TURN event', () => {
  test('Sends PLAYER_MOVE event', (done) => {
    const player = computerPlayerFactory();
    const board = boardFactory();

    const token = PubSub.subscribe(eventTypes.PLAYER_MOVE, (_, data) => {
      try {
        expect(data.player).toBe(player);
        done();
      } catch (error) {
        done(error);
      } finally {
        PubSub.unsubscribe(token);
      }
    });

    PubSub.publish(eventTypes.NEXT_TURN, { player, board });
  });

  test('Sends PLAYER_MOVE event with a pos', (done) => {
    const player = computerPlayerFactory();
    const board = boardFactory();

    const token = PubSub.subscribe(eventTypes.PLAYER_MOVE, (_, { pos }) => {
      try {
        expect(typeof pos[0]).toBe('number');
        expect(typeof pos[1]).toBe('number');
        done();
      } catch (error) {
        done(error);
      } finally {
        PubSub.unsubscribe(token);
      }
    });

    PubSub.publishSync(eventTypes.NEXT_TURN, { player, board });
  });
});
