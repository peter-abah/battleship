import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import { randomElement } from './helperFuncs';
import shipFactory from './shipFactory';
import boardFactory from './boardFactory';

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

  // TODO REFACTOR THIS METHOD
  const generateBoard = () => {
    const board = boardFactory();
    let positions = genAllBoardPositions(board);
    const orientations = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    const shipLengths = [5, 4, 3, 3, 2];

    shipLengths.forEach((length) => {
      let isShipCreated = false;

      while (!isShipCreated) {
        const randomPos = randomElement(positions);

        isShipCreated = orientations.some((orientation) => {
          const ship = shipFactory({
            startPos: randomPos,
            length,
            orientation,
          });
          const isShipAdded = board.addShip(ship);
          return isShipAdded;
        });
        positions = positions.filter((elem) => elem !== randomPos);
      }
    });

    return board;
  };

  const board = generateBoard();
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
