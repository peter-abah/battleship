const shipFactory = ({
  startPos = [0, 0],
  length = 1,
  orientation = [0, 1],
} = {}) => {
  const initPositions = () => {
    const positions = [startPos];
    for (let i = 1; i < length; i += 1) {
      const [y, x] = positions[i - 1];
      const next = [orientation[0] + y, orientation[1] + x];
      positions[i] = next;
    }
    return positions;
  };

  const positions = initPositions();
  const attackedPositions = [];

  const isPos = (pos) =>
    positions.some((e) => e[0] === pos[0] && e[1] === pos[1]);

  const receiveAttack = (pos) => {
    if (!isPos(pos)) return false;

    attackedPositions.push(pos);
    return true;
  };

  const isSunk = () => attackedPositions.length === positions.length;

  const self = {
    startPos,
    length,
    orientation,
    positions,
    attackedPositions,
    receiveAttack,
    isPos,
    isSunk,
  };

  return self;
};

export default shipFactory;
