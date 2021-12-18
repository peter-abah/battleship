import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import createDOMBoard from './createDOMBoard';
import playerFactory from './playerFactory';
import computerPlayerFactory from './computerPlayerFactory';
import Game from './game';

const gameUI = () => {
  const makeMove = (event) => {
    let { pos } = event.target.dataset;
    pos = pos.split('').map((e) => Number(e));

    PubSub.publish(eventTypes.MOVE_INPUT, { pos });
    event.stopPropagation();
  };

  const updateUI = (_, { player }) => {
    if (player === players.player) {
      PubSub.publish(eventTypes.UPDATE_BOARD, dom.playerBoard);
    } else {
      PubSub.publish(eventTypes.UPDATE_BOARD, dom.computerBoard);
    }
  };

  const addBoardsToDom = () => {
    dom.playerBoardWrapper.appendChild(dom.playerBoard);
    dom.computerBoardWrapper.appendChild(dom.computerBoard);
  };

  const addEventListeners = () => {
    const cells = [...dom.computerBoard.children];
    cells.forEach((cell) => cell.addEventListener('click', makeMove));
  };

  const createGameBoards = () => {
    dom.playerBoard = createDOMBoard(players.player.board);
    dom.computerBoard = createDOMBoard(players.computer.board.forOpponent());
  };

  const startGame = (_, { ships }) => {
    players = {
      player: playerFactory({ ships }),
      computer: computerPlayerFactory(),
    };

    createGameBoards();
    addEventListeners();
    addBoardsToDom();

    PubSub.subscribe(eventTypes.UPDATE_UI, updateUI);

    const game = Game(Object.values(players));
    game.start();
  };

  const dom = {
    playerBoardWrapper: document.getElementById('player-board'),
    computerBoardWrapper: document.getElementById('computer-board'),
  };

  let players = null;

  PubSub.subscribe(eventTypes.GAME_START, startGame);
};

export default gameUI;
