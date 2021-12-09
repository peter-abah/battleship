const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const getAllShipsPositions = () =>
    ships.reduce((positions, ship) => positions.concat(ship.positions), []);

  const validateShips = () => {
    const checkedPositions = {};
    const shipPositions = getAllShipsPositions();
    shipPositions.forEach((e) => {
      if (checkedPositions[e]) throw new Error('Invalid ship placements');
      checkedPositions[e] = true;
    });
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
