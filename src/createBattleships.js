import shipFactory from './shipFactory';

const createBattleships = () =>
  [5, 4, 3, 3, 2].map((length) => shipFactory({ length }));

export default createBattleships;
