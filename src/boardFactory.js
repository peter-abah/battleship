import { randomElement } from './helperFuncs';
import shipFactory from './shipFactory';

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const genAllBoardIndices = () => {
    const result = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        result.push([y, x]);
      }
    }
    return result;
  };

  const getAllShipsPositions = (boardShips) =>
    boardShips.reduce(
      (positions, ship) => positions.concat(ship.positions),
      []
    );

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

  const isShipsValid = (boardShips) => {
    const shipsPositions = getAllShipsPositions(boardShips);
    return !(
      isShipsOutOfBounds(shipsPositions) || isShipsOverlapping(shipsPositions)
    );
  };

  const canShipBeAdded = (ship) => {
    const boardShips = [...ships, ship];
    return isShipsValid(boardShips);
  };

  const validateShips = () => {
    if (!isShipsValid(ships)) throw new Error('Invalid ship placements');
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

  const allIndices = Object.freeze(genAllBoardIndices());

  const self = {
    ships,
    width,
    height,
    allIndices,
    attackedPositions,
    isAttackValid,
    receiveAttack,
    sunkShips,
    isAllShipsSunk,
    addShip,
    canShipBeAdded,
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

  const getShipForPos = (startPos, length) => {
    const ships = orientations.map((orientation) =>
      shipFactory({ startPos, length, orientation })
    );
    return ships.filter((ship) => board.canShipBeAdded(ship))[0];
  };

  const tryToAddShip = (length) => {
    const randomPos = randomElement(boardPositions);
    boardPositions = boardPositions.filter((elem) => elem !== randomPos);

    const ship = getShipForPos(randomPos, length);
    if(!ship) return false;

    board.addShip(ship);
    return true;
  };

  const addShips = () => {
    shipLengths.forEach((length) => {
      let isShipAdded = false;
      while (!isShipAdded) isShipAdded = tryToAddShip(length);
    });
  };

  const board = boardFactory();
  let boardPositions = board.allIndices.map(([y, x]) => [y, x]); // to deep copy the array
  addShips();

  return board;
};

export default boardFactory;
export { boardFactory, randomBattleShipBoard };
