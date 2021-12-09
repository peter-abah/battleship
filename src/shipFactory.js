const shipFactory = ({ startPos, length, orientation }) => {
  const initPositions = () => {
    const positions = [startPos];
    for (let i = 1; i < length; i += 1) {
      const [x, y] = positions[i - 1];
      const next = [orientation[0] + x, orientation[1] + y];
      positions[i] = next;
    }
    return positions;
  };

  const self = {
    startPos,
    length,
    orientation,
    positions: initPositions(),
  };
  Object.freeze(self);

  return self;
};

export default shipFactory;
