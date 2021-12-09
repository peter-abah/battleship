const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const initState = () =>
    new Array(height).fill().map(() => new Array(width).fill(0));

  const state = initState();

  const self = {
    state,
    ships,
  };

  return self;
};

export default boardFactory;
