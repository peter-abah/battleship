import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import { randomElement } from './helperFuncs';
import { randomBattleShipBoard } from './boardFactory';

const computerPlayerFactory = () => {
  const genAllBoardPositions = (board) => {
    const result = [];
    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        result.push([y, x]);
      }
    }
    return result;
  };

  const board = randomBattleShipBoard();
  const self = { board };

  const makeMove = (_, { player, board: opponentBoard }) => {
    if (player !== self) return;

    const positions = genAllBoardPositions(opponentBoard);
    const pos = randomElement(positions);
    PubSub.publish(eventTypes.PLAYER_MOVE, { player: self, pos });
  };

  PubSub.subscribe(eventTypes.NEXT_TURN, makeMove);

  return self;
};

export default computerPlayerFactory;
