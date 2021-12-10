import boardFactory from './boardFactory';

const playerFactory = ({ships = []} = {}) => {
  const board = boardFactory({ships});

  const self = {
    board,
  }

  return self;
};

export default playerFactory;
