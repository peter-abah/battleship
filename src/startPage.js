import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import boardFactory from './boardFactory';
import shipFactory from './shipFactory';
import createBattleships from './createBattleships';
import createDOMBoard from './createDOMBoard';
import randomBattleShipBoard from './randomBattleShipBoard';

const HORIZONTAL_ORIENTATION = [0, 1];
const VERTICAL_ORIENTATION = [1, 0];

const createDOMShips = (ships) => {
  const shipNames = {
    5: 'ship--carrier',
    4: 'ship--battleship',
    3: 'ship--cruiser',
    2: 'ship--destroyer',
  };

  return ships.map((ship) => {
    const shipDOM = document.createElement('button');
    const shipClassName = shipNames[ship.length];
    shipDOM.classList.add('ship');
    shipDOM.classList.add(shipClassName);

    shipDOM.dataset.length = ship.length;
    return shipDOM;
  });
};

const startPage = () => {
  const addShip = (event) => {
    if (shipLength === null) return;

    const selectedShip = document.querySelector('.ship--selected');
    let startPos = event.target.dataset.pos;
    startPos = startPos.split('').map((e) => Number(e));
    const ship = shipFactory({ startPos, orientation, length: shipLength });

    if (initBoard.canShipBeAdded(ship)) {
      initBoard.addShip(ship);
      selectedShip.remove();
      shipLength = null;
      PubSub.publish(eventTypes.UPDATE_BOARD, dom.board);
    }

    event.stopPropagation();
  };

  const resetShips = () => {
    initBoard = boardFactory();
    const ships = createBattleships();

    dom.ships = createDOMShips(ships);
    dom.board = createDOMBoard(initBoard);

    dom.board.addEventListener('click', addShip);
    dom.ships.forEach((ship) => ship.addEventListener('click', selectShip));
    addBoardAndShipsToDom();
  };

  const selectShip = (event) => {
    shipLength = Number(event.target.dataset.length);
    dom.ships.forEach((ship) => ship.classList.remove('ship--selected'));
    event.target.classList.add('ship--selected');
  };

  const changeOrientation = (event) => {
    switch (event.target.value) {
      case '0':
        orientation = HORIZONTAL_ORIENTATION;
        break;
      case '1':
        orientation = VERTICAL_ORIENTATION;
        break;
      default:
        orientation = HORIZONTAL_ORIENTATION;
    }
  };

  const randomBoard = () => {
    dom.shipsWrapper.replaceChildren();
    dom.ships = [];

    initBoard = randomBattleShipBoard();
    dom.board = createDOMBoard(initBoard);
    dom.boardWrapper.replaceChildren(dom.board);
  };

  const startGame = () => {
    if (initBoard.ships.length !== 5) return;

    dom.parent.classList.toggle('section--hidden');
    PubSub.publish(eventTypes.GAME_START, { ships: initBoard.ships });
    resetShips();
  };

  const addEventListeners = () => {
    dom.board.addEventListener('click', addShip);
    dom.ships.forEach((ship) => ship.addEventListener('click', selectShip));
    dom.startBtn.addEventListener('click', startGame);
    dom.orientationSelect.addEventListener('change', changeOrientation);
    dom.randomShipsBtn.addEventListener('click', randomBoard);
    dom.resetBtn.addEventListener('click', resetShips);
  };

  const addBoardAndShipsToDom = () => {
    dom.boardWrapper.replaceChildren(dom.board);

    dom.shipsWrapper.replaceChildren();
    dom.ships.forEach((ship) => dom.shipsWrapper.appendChild(ship));
  };

  const newGame = () => {
    dom.parent.classList.toggle('section--hidden');
  };

  let orientation = HORIZONTAL_ORIENTATION;
  let shipLength = null;
  let initBoard = boardFactory();
  const ships = createBattleships();
  const dom = {
    parent: document.getElementById('start'),
    boardWrapper: document.getElementById('board-wrapper'),
    shipsWrapper: document.getElementById('ships-wrapper'),
    startBtn: document.getElementById('start-btn'),
    orientationSelect: document.getElementById('ship-orientation'),
    randomShipsBtn: document.getElementById('random-ships'),
    resetBtn: document.getElementById('reset-ships'),
    board: createDOMBoard(initBoard),
    ships: createDOMShips(ships),
  };

  addBoardAndShipsToDom();
  addEventListeners();

  PubSub.subscribe(eventTypes.NEW_GAME, newGame);
};

export default startPage;
