const shipFactory = ({ startPos, length, orientation }) => {
  const self = {
    startPos,
    length,
    orientation,
  };
  Object.freeze(self);

  return self;
};

export default shipFactory;
