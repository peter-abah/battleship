import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import boardFactory from './boardFactory';

const playerFactory = ({ ships = [] } = {}) => {
  let isPlayerTurn = false;
  const board = boardFactory({ ships });
  const self = { board };

  const updateTurn = (_, { player }) => {
    if (player !== self) return;

    isPlayerTurn = true;
  };

  const makeMove = (_, { pos }) => {
    if (!isPlayerTurn) return;

    PubSub.publish(eventTypes.PLAYER_MOVE, { pos });
    isPlayerTurn = false;
  };

  PubSub.subscribe(eventTypes.NEXT_TURN, updateTurn);
  PubSub.subscribe(eventTypes.MOVE_INPUT, makeMove);

  return self;
};

export default playerFactory;
