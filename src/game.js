import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';

const game = (players) => {
  let currentPlayerIndex = 0;

  const nextPlayerIndex = () => (currentPlayerIndex + 1) % players.length;

  const isPosValid = (opponent, pos) => opponent.board.isAttackValid(pos);

  const isGameEnd = () => {
    const player = players[currentPlayerIndex];
    return (
      player.board.isAllShipsSunk() || player.board.isAllPositionsAttacked()
    );
  };

  const start = () => {
    const nextPlayer = players[currentPlayerIndex];
    const opponent = players[nextPlayerIndex()];
    const boardForPlayer = opponent.board.forOpponent();

    PubSub.publish(eventTypes.UPDATE_UI, { players });
    PubSub.publish(eventTypes.NEXT_TURN, {
      player: nextPlayer,
      board: boardForPlayer,
    });
  };

  const makeMove = (_, { player, pos }) => {
    const currentPlayer = players[currentPlayerIndex];
    const opponent = players[nextPlayerIndex()];

    if (player === currentPlayer && isPosValid(opponent, pos)) {
      opponent.board.receiveAttack(pos);
      currentPlayerIndex = nextPlayerIndex();
    }

    PubSub.publish(eventTypes.UPDATE_UI, { player: opponent });

    if (isGameEnd()) {
      PubSub.publish(eventTypes.GAME_END, { players, winner: currentPlayer });
    } else {
      const nextPlayer = players[currentPlayerIndex];
      const boardForPlayer = player.board.forOpponent();

      PubSub.publish(eventTypes.NEXT_TURN, {
        player: nextPlayer,
        board: boardForPlayer,
      });
    }
  };

  PubSub.subscribe(eventTypes.PLAYER_MOVE, makeMove);

  return { start };
};

export default game;
