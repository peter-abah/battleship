import PubSub from 'pubsub-js';
import eventTypes from './eventTypes';
import boardFactory from './boardFactory';
import shipFactory from './shipFactory';
import createBattleships from './createBattleships';
import createDOMBoard from './createDOMBoard';

const HORIZONTAL_ORIENTATION = Object.freeze([1, 0]);
const VERTICAL_ORIENTATION = Object.freeze([0, 1]);

const createDOMShips = (ships) => {
  const shipNames = {
    5: 'carrier',
    4: 'battleship',
    3: 'cruiser',
    2: 'destroyer',
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
      PubSub.publish(eventTypes.UPDATE_BOARD, dom.board);
    }

    shipLength = null;
    selectedShip.classList.remove('ship--selected');

    event.stopPropagation();
  };

  const selectShip = (event) => {
    shipLength = Number(event.target.dataset.length);
    event.target.classList.add('ship--selected');
  };

  const changeOrientation = () => {
    if (orientation === HORIZONTAL_ORIENTATION) {
      orientation = VERTICAL_ORIENTATION;
    } else {
      orientation = HORIZONTAL_ORIENTATION;
    }
  };

  const startGame = () => {
    if (initBoard.ships.length !== 5) return;

    PubSub.publish(eventTypes.GAME_START, { ships: initBoard.ships });
  };

  const addEventListeners = () => {
    dom.board.addEventListener('click', addShip);
    dom.ships.forEach((ship) => ship.addEventListener('click', selectShip));
    dom.startBtn.addEventListener('click', startGame);
    dom.changeOrientationBtn.addEventListener('click', changeOrientation);
  };

  const addBoardAndShipsToDom = () => {
    dom.boardWrapper.appendChild(dom.board);
    dom.ships.forEach((ship) => dom.shipsWrapper.appendChild(ship));
  };

  let orientation = HORIZONTAL_ORIENTATION;
  let shipLength = null;
  const initBoard = boardFactory();
  const ships = createBattleships();
  const dom = {
    parent: document.getElementById('start'),
    boardWrapper: document.getElementById('board-wrapper'),
    shipsWrapper: document.getElementById('ships-wrapper'),
    startBtn: document.getElementById('start'),
    changeOrientationBtn: document.getElementById('change-orientation'),
    board: createDOMBoard(initBoard),
    ships: createDOMShips(ships),
  };

  addBoardAndShipsToDom();
  addEventListeners();
};

export default startPage;
