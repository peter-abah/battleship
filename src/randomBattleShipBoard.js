import boardFactory from './boardFactory';
import shipFactory from './shipFactory';
import { randomElement } from './helperFuncs';

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
    const validShips = ships.filter((ship) => board.canShipBeAdded(ship));
    return randomElement(validShips);
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

export default randomBattleShipBoard;