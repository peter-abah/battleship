const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const getAllShipsPositions = () =>
    ships.reduce((positions, ship) => positions.concat(ship.positions), []);

  const isShipsOverlapping = (positions) => {
    const checkedPositions = {};
    return !positions.every((e) => {
      if (checkedPositions[e]) return false;

      checkedPositions[e] = true;
      return true;
    });
  };

  const isShipsOutOfBounds = (positions) =>
    !positions.every(([x, y]) => x < width && y < height && x >= 0 && y >= 0);

  const validateShips = () => {
    const shipsPositions = getAllShipsPositions();
    if (
      isShipsOutOfBounds(shipsPositions)
      || isShipsOverlapping(shipsPositions)
    ) {
      throw new Error('Invalid ship placements');
    }
    return true;
  };

  const initState = () =>
    new Array(height).fill().map(() => new Array(width).fill(false));

  validateShips();
  const state = initState();

  const square_at = ({x, y}) => state[y][x];

  const receiveAttack = ([y, x]) => {
    state[y][x] = true
    const attackedShip = ships.filter((ship) => ship.isPos([y, x]))[0];
    if (!attackedShip) return false;

    attackedShip.receiveAttack([y, x]);
    return true;
  };

  const self = {
    state,
    ships,
    width,
    height,
    square_at,
    receiveAttack,
  };

  return self;
};

export default boardFactory;
