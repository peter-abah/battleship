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
    new Array(height).fill().map(() => new Array(width).fill(0));

  validateShips();
  const state = initState();

  const self = {
    state,
    ships,
  };

  return self;
};

export default boardFactory;
