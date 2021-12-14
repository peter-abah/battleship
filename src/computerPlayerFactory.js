import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import { randomElement } from './helperFuncs';
import randomBattleShipBoard from './randomBattleShipBoard';

const computerPlayerFactory = () => {
  const board = randomBattleShipBoard();
  const self = { board };

  const randomAttack = (opponentBoard) => {
    const positions = opponentBoard.allIndices.filter(
      ([y, x]) =>
        !opponentBoard.attackedPositions.some(
          (pos) => pos[0] === y && pos[1] === x
        )
    );

    return randomElement(positions);
  };

  const makeMove = (_, { player, board: opponentBoard }) => {
    if (player !== self) return;

    const pos = randomAttack(opponentBoard);
    PubSub.publish(eventTypes.PLAYER_MOVE, { player: self, pos });
  };

  PubSub.subscribe(eventTypes.NEXT_TURN, makeMove);

  return self;
};

export default computerPlayerFactory;
