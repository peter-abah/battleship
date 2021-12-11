import PubSub from 'pubsub-js';
import eventTypes from '../eventTypes';
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
    expect(playerBoard.ships).toContain(ship1, ship2);
  });
});

describe('Sends a PLAYER_MOVE event in response to correct events', () => {
  test('Sends event when NEXT_TURN and MOVE_INPUT events are received consecutively', (done) => {
    const player = playerFactory();

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

    PubSub.publishSync(eventTypes.NEXT_TURN, { player });
    PubSub.publishSync(eventTypes.MOVE_INPUT, { pos: [0, 0] });
  });

  test('Sends the pos received from MOVE_INPUT event', (done) => {
    const player = playerFactory();

    const token = PubSub.subscribe(eventTypes.PLAYER_MOVE, (_, data) => {
      try {
        expect(data.pos).toEqual([0, 0]);
        done();
      } catch (error) {
        done(error);
      } finally {
        PubSub.unsubscribe(token);
      }
    });

    PubSub.publishSync(eventTypes.NEXT_TURN, { player });
    PubSub.publishSync(eventTypes.MOVE_INPUT, { pos: [0, 0] });
  });
});
