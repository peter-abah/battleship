import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import { randomElement } from './helperFuncs';
import randomBattleShipBoard from './randomBattleShipBoard';

const computerPlayerFactory = () => {
  const board = randomBattleShipBoard();
  const self = { board };

  const makeMove = (_, { player, board: opponentBoard }) => {
    if (player !== self) return;

    const positions = opponentBoard.allIndices;
    const pos = randomElement(positions);
    PubSub.publish(eventTypes.PLAYER_MOVE, { player: self, pos });
  };

  PubSub.subscribe(eventTypes.NEXT_TURN, makeMove);

  return self;
};

export default computerPlayerFactory;
