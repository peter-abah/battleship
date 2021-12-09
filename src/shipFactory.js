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

  const positions = initPositions();
  const attackedPositions = [];

  const canAttack = (pos) =>
    positions.some((e) => e[0] === pos[0] && e[1] === pos[1]);

  const receiveAttack = (pos) => {
    if (!canAttack(pos)) return false;

    attackedPositions.push(pos);
    return true;
  };

  const self = {
    startPos,
    length,
    orientation,
    positions,
    attackedPositions,
    receiveAttack,
  };
  Object.freeze(self);

  return self;
};

export default shipFactory;
