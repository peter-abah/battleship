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

  const clearDOM = () => {
    players = null;
    dom.playerBoard = null;
    dom.computerBoard = null;
    dom.playerBoardWrapper.replaceChildren();
    dom.computerBoardWrapper.replaceChildren();
    dom.message.textContent = '';
    dom.parent.classList.toggle('section--hidden');
  };

  const newGame = () => {
    clearDOM();
    PubSub.publish(eventTypes.NEW_GAME);
  };

  const endGame = (_, { winner }) => {
    let message = 'Game over, ';
    if (winner === players.player) {
      message += 'You win';
    } else {
      message += 'You lost';
    }

    dom.message.textContent = message;
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
    PubSub.subscribe(eventTypes.GAME_END, endGame);

    const game = Game(Object.values(players));
    dom.parent.classList.toggle('section--hidden');
    game.start();
  };

  const dom = {
    parent: document.getElementById('game'),
    message: document.getElementById('game-message'),
    playerBoardWrapper: document.getElementById('player-board'),
    computerBoardWrapper: document.getElementById('computer-board'),
    newGameBtn: document.getElementById('new-game'),
  };
  dom.newGameBtn.addEventListener('click', newGame);

  let players = null;

  PubSub.subscribe(eventTypes.GAME_START, startGame);
};

export default gameUI;
