import { randomElement } from './helperFuncs';
import shipFactory from './shipFactory';

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const getAllShipsPositions = (ships_) =>
    ships_.reduce((positions, ship) => positions.concat(ship.positions), []);

  const isShipsOverlapping = (positions) => {
    const checkedPositions = {};
    return !positions.every((e) => {
      if (checkedPositions[e]) return false;

      checkedPositions[e] = true;
      return true;
    });
  };

  const isPosInBounds = ([y, x]) => x < width && y < height && x >= 0 && y >= 0;

  const isShipsOutOfBounds = (positions) => !positions.every(isPosInBounds);

  const validateShips = () => {
    const shipsPositions = getAllShipsPositions(ships);
    if (
      isShipsOutOfBounds(shipsPositions) ||
      isShipsOverlapping(shipsPositions)
    ) {
      throw new Error('Invalid ship placements');
    }
    return true;
  };

  validateShips();

  const attackedPositions = [];

  const isPosBeenAttacked = ([y, x]) =>
    attackedPositions.some((pos) => pos[0] === y && pos[1] === x);

  const isAttackValid = ([y, x]) =>
    isPosInBounds([y, x]) && !isPosBeenAttacked([y, x]);

  const receiveAttack = ([y, x]) => {
    if (!isAttackValid([y, x])) throw new Error('Invalid Attack');

    attackedPositions.push([y, x]);
    const attackedShip = ships.filter((ship) => ship.isPos([y, x]))[0];
    if (!attackedShip) return false;

    attackedShip.receiveAttack([y, x]);
    return true;
  };

  const addShip = (ship) => {
    const updatedShipPositions = getAllShipsPositions([...ships, ship]);
    if (
      isShipsOverlapping(updatedShipPositions) ||
      isShipsOutOfBounds(updatedShipPositions)
    ) {
      return false;
    }

    ships.push(ship);
    return true;
  };

  const sunkShips = () => ships.filter((ship) => ship.isSunk());

  const isAllShipsSunk = () => sunkShips().length === ships.length;

  const self = {
    ships,
    width,
    height,
    isAttackValid,
    receiveAttack,
    attackedPositions,
    sunkShips,
    isAllShipsSunk,
    addShip,
  };

  return self;
};

const randomBattleShipBoard = () => {
  const orientations = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  const shipLengths = [5, 4, 3, 3, 2];

  const genAllBoardPositions = (board) => {
    const result = [];
    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        result.push([y, x]);
      }
    }
    return result;
  };

  const addShipToBoard = (length) => {
    const randomPos = randomElement(boardPositions);

    const isShipCreated = orientations.some((orientation) => {
      const ship = shipFactory({
        startPos: randomPos,
        length,
        orientation,
      });
      const isShipAdded = board.addShip(ship);
      return isShipAdded;
    });

    const positions = boardPositions.filter((elem) => elem !== randomPos);

    return { positions, isShipCreated };
  };

  const addShips = () => {
    shipLengths.forEach((length) => {
      let isShipCreated = false;

      while (!isShipCreated) {
        ({ isShipCreated, positions: boardPositions } = addShipToBoard(length));
      }
    });
  };

  const board = boardFactory();
  let boardPositions = genAllBoardPositions(board);
  addShips();

  return board;
};

export default boardFactory;
export { boardFactory, randomBattleShipBoard };
