/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/pubsub-js/src/pubsub.js":
/*!**********************************************!*\
  !*** ./node_modules/pubsub-js/src/pubsub.js ***!
  \**********************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/mroderick/PubSubJS
 */

(function (root, factory){
    'use strict';

    var PubSub = {};

    if (root.PubSub) {
        PubSub = root.PubSub;
        console.warn("PubSub already loaded, using existing version");
    } else {
        root.PubSub = PubSub;
        factory(PubSub);
    }
    // CommonJS and Node.js module support
    if (true){
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
        module.exports = exports = PubSub; // CommonJS
    }
    // AMD support
    /* eslint-disable no-undef */
    else {}

}(( typeof window === 'object' && window ) || this, function (PubSub){
    'use strict';

    var messages = {},
        lastUid = -1,
        ALL_SUBSCRIBING_MSG = '*';

    function hasKeys(obj){
        var key;

        for (key in obj){
            if ( Object.prototype.hasOwnProperty.call(obj, key) ){
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a function that throws the passed exception, for use as argument for setTimeout
     * @alias throwException
     * @function
     * @param { Object } ex An Error object
     */
    function throwException( ex ){
        return function reThrowException(){
            throw ex;
        };
    }

    function callSubscriberWithDelayedExceptions( subscriber, message, data ){
        try {
            subscriber( message, data );
        } catch( ex ){
            setTimeout( throwException( ex ), 0);
        }
    }

    function callSubscriberWithImmediateExceptions( subscriber, message, data ){
        subscriber( message, data );
    }

    function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
        var subscribers = messages[matchedMessage],
            callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
            s;

        if ( !Object.prototype.hasOwnProperty.call( messages, matchedMessage ) ) {
            return;
        }

        for (s in subscribers){
            if ( Object.prototype.hasOwnProperty.call(subscribers, s)){
                callSubscriber( subscribers[s], originalMessage, data );
            }
        }
    }

    function createDeliveryFunction( message, data, immediateExceptions ){
        return function deliverNamespaced(){
            var topic = String( message ),
                position = topic.lastIndexOf( '.' );

            // deliver the message as it is now
            deliverMessage(message, message, data, immediateExceptions);

            // trim the hierarchy and deliver message to each level
            while( position !== -1 ){
                topic = topic.substr( 0, position );
                position = topic.lastIndexOf('.');
                deliverMessage( message, topic, data, immediateExceptions );
            }

            deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
        };
    }

    function hasDirectSubscribersFor( message ) {
        var topic = String( message ),
            found = Boolean(Object.prototype.hasOwnProperty.call( messages, topic ) && hasKeys(messages[topic]));

        return found;
    }

    function messageHasSubscribers( message ){
        var topic = String( message ),
            found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
            position = topic.lastIndexOf( '.' );

        while ( !found && position !== -1 ){
            topic = topic.substr( 0, position );
            position = topic.lastIndexOf( '.' );
            found = hasDirectSubscribersFor(topic);
        }

        return found;
    }

    function publish( message, data, sync, immediateExceptions ){
        message = (typeof message === 'symbol') ? message.toString() : message;

        var deliver = createDeliveryFunction( message, data, immediateExceptions ),
            hasSubscribers = messageHasSubscribers( message );

        if ( !hasSubscribers ){
            return false;
        }

        if ( sync === true ){
            deliver();
        } else {
            setTimeout( deliver, 0 );
        }
        return true;
    }

    /**
     * Publishes the message, passing the data to it's subscribers
     * @function
     * @alias publish
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publish = function( message, data ){
        return publish( message, data, false, PubSub.immediateExceptions );
    };

    /**
     * Publishes the message synchronously, passing the data to it's subscribers
     * @function
     * @alias publishSync
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publishSync = function( message, data ){
        return publish( message, data, true, PubSub.immediateExceptions );
    };

    /**
     * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
     * @function
     * @alias subscribe
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { String }
     */
    PubSub.subscribe = function( message, func ){
        if ( typeof func !== 'function'){
            return false;
        }

        message = (typeof message === 'symbol') ? message.toString() : message;

        // message is not registered yet
        if ( !Object.prototype.hasOwnProperty.call( messages, message ) ){
            messages[message] = {};
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = 'uid_' + String(++lastUid);
        messages[message][token] = func;

        // return token for unsubscribing
        return token;
    };

    PubSub.subscribeAll = function( func ){
        return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
    };

    /**
     * Subscribes the passed function to the passed message once
     * @function
     * @alias subscribeOnce
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { PubSub }
     */
    PubSub.subscribeOnce = function( message, func ){
        var token = PubSub.subscribe( message, function(){
            // before func apply, unsubscribe message
            PubSub.unsubscribe( token );
            func.apply( this, arguments );
        });
        return PubSub;
    };

    /**
     * Clears all subscriptions
     * @function
     * @public
     * @alias clearAllSubscriptions
     */
    PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
        messages = {};
    };

    /**
     * Clear subscriptions by the topic
     * @function
     * @public
     * @alias clearAllSubscriptions
     * @return { int }
     */
    PubSub.clearSubscriptions = function clearSubscriptions(topic){
        var m;
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                delete messages[m];
            }
        }
    };

    /**
       Count subscriptions by the topic
     * @function
     * @public
     * @alias countSubscriptions
     * @return { Array }
    */
    PubSub.countSubscriptions = function countSubscriptions(topic){
        var m;
        // eslint-disable-next-line no-unused-vars
        var token;
        var count = 0;
        for (m in messages) {
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0) {
                for (token in messages[m]) {
                    count++;
                }
                break;
            }
        }
        return count;
    };


    /**
       Gets subscriptions by the topic
     * @function
     * @public
     * @alias getSubscriptions
    */
    PubSub.getSubscriptions = function getSubscriptions(topic){
        var m;
        var list = [];
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                list.push(m);
            }
        }
        return list;
    };

    /**
     * Removes subscriptions
     *
     * - When passed a token, removes a specific subscription.
     *
	 * - When passed a function, removes all subscriptions for that function
     *
	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
     * @function
     * @public
     * @alias subscribeOnce
     * @param { String | Function } value A token, function or topic to unsubscribe from
     * @example // Unsubscribing with a token
     * var token = PubSub.subscribe('mytopic', myFunc);
     * PubSub.unsubscribe(token);
     * @example // Unsubscribing with a function
     * PubSub.unsubscribe(myFunc);
     * @example // Unsubscribing from a topic
     * PubSub.unsubscribe('mytopic');
     */
    PubSub.unsubscribe = function(value){
        var descendantTopicExists = function(topic) {
                var m;
                for ( m in messages ){
                    if ( Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0 ){
                        // a descendant of the topic exists:
                        return true;
                    }
                }

                return false;
            },
            isTopic    = typeof value === 'string' && ( Object.prototype.hasOwnProperty.call(messages, value) || descendantTopicExists(value) ),
            isToken    = !isTopic && typeof value === 'string',
            isFunction = typeof value === 'function',
            result = false,
            m, message, t;

        if (isTopic){
            PubSub.clearSubscriptions(value);
            return;
        }

        for ( m in messages ){
            if ( Object.prototype.hasOwnProperty.call( messages, m ) ){
                message = messages[m];

                if ( isToken && message[value] ){
                    delete message[value];
                    result = value;
                    // tokens are unique, so we can just stop here
                    break;
                }

                if (isFunction) {
                    for ( t in message ){
                        if (Object.prototype.hasOwnProperty.call(message, t) && message[t] === value){
                            delete message[t];
                            result = true;
                        }
                    }
                }
            }
        }

        return result;
    };
}));


/***/ }),

/***/ "./src/boardFactory.js":
/*!*****************************!*\
  !*** ./src/boardFactory.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _helperFuncs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helperFuncs */ "./src/helperFuncs.js");
/* harmony import */ var _shipFactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shipFactory */ "./src/shipFactory.js");



const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

const boardFactory = ({
  ships = [],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
} = {}) => {
  const genAllBoardIndices = () => {
    const result = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        result.push([y, x]);
      }
    }
    return result;
  };

  const getAllShipsPositions = (boardShips) =>
    boardShips.reduce(
      (positions, ship) => positions.concat(ship.positions),
      []
    );

  const isShipsOverlapping = (positions) => {
    const checkedPositions = {};
    return !positions.every((e) => {
      if (checkedPositions[e]) return false;

      checkedPositions[e] = true;
      return true;
    });
  };

  const isPosInBounds = ([y, x]) => x < width && y < height && x >= 0 && y >= 0;

  const isShipsOutOfBounds = (positions) => !positions.every(isPosInBounds);

  const isShipsValid = (boardShips) => {
    const shipsPositions = getAllShipsPositions(boardShips);
    return !(
      isShipsOutOfBounds(shipsPositions) || isShipsOverlapping(shipsPositions)
    );
  };

  const canShipBeAdded = (ship) => {
    const boardShips = [...ships, ship];
    return isShipsValid(boardShips);
  };

  const validateShips = () => {
    if (!isShipsValid(ships)) throw new Error('Invalid ship placements');
  };

  validateShips();

  const attackedPositions = [];

  const hasPosBeenAttacked = ([y, x]) =>
    attackedPositions.some((pos) => pos[0] === y && pos[1] === x);

  const isAttackValid = ([y, x]) =>
    isPosInBounds([y, x]) && !hasPosBeenAttacked([y, x]);

  const receiveAttack = ([y, x]) => {
    if (!isAttackValid([y, x])) throw new Error('Invalid Attack');

    attackedPositions.push([y, x]);
    const attackedShip = ships.filter((ship) => ship.isPos([y, x]))[0];
    if (!attackedShip) return false;

    attackedShip.receiveAttack([y, x]);
    return true;
  };

  const addShip = (ship) => {
    const updatedShipPositions = getAllShipsPositions([...ships, ship]);
    if (
      isShipsOverlapping(updatedShipPositions) ||
      isShipsOutOfBounds(updatedShipPositions)
    ) {
      return false;
    }

    ships.push(ship);
    return true;
  };

  const sunkShips = () => ships.filter((ship) => ship.isSunk());

  const isAllShipsSunk = () => sunkShips().length === ships.length;

  const isAllPositionsAttacked = () => attackedPositions.length === allIndices.length;

  const allIndices = Object.freeze(genAllBoardIndices());

  const forOpponent = () => {
    // eslint-disable-next-line no-shadow
    const { ships, receiveAttack, addShip, ...rest } = self;
    rest.ships = [];
    return rest;
  };

  const self = {
    ships,
    width,
    height,
    allIndices,
    attackedPositions,
    isAttackValid,
    receiveAttack,
    hasPosBeenAttacked,
    isAllPositionsAttacked,
    sunkShips,
    isAllShipsSunk,
    addShip,
    canShipBeAdded,
    forOpponent,
  };

  return self;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (boardFactory);


/***/ }),

/***/ "./src/createBattleships.js":
/*!**********************************!*\
  !*** ./src/createBattleships.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _shipFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shipFactory */ "./src/shipFactory.js");


const createBattleships = () =>
  [5, 4, 3, 3, 2].map((length) => (0,_shipFactory__WEBPACK_IMPORTED_MODULE_0__["default"])({ length }));

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createBattleships);


/***/ }),

/***/ "./src/createDOMBoard.js":
/*!*******************************!*\
  !*** ./src/createDOMBoard.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _eventTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eventTypes */ "./src/eventTypes.js");



const isShipPos = (board, pos) => {
  board.ships.some((ship) => ship.isPos(pos));
};

const addClassNamesToCell = (cell, board, pos) => {
  cell.classList.add('board__cell');

  if (board.hasPosBeenAttacked(pos)) {
    cell.classList.add('board__cell--attacked');
  }

  if (isShipPos(board, pos)) {
    cell.classList.add('board__cell--ship');
  }
};

const createDOMBoard = (board) => {
  const updateBoard = (_, data) => {
    if (data !== boardDom) return;

    board.attackedPositions.forEach(([y, x]) => {
      const cellSelector = `[data ="${y}${x}"]`;
      const cell = boardDom.querySelector(cellSelector);
      cell.classList.add('board__cell--attacked');
    });

    const shipsPos = board.ships.reduce((acc, ship) => acc.concat(ship.positions), []);
    shipsPos.forEach(([y, x]) => {
      const cellSelector = `[data-pos="${y}${x}"]`;
      const cell = boardDom.querySelector(cellSelector);
      cell.classList.add('board__cell--ship');
    });
  };

  const boardDom = document.createElement('div');
  boardDom.className = 'board';

  board.allIndices.forEach(([y, x]) => {
    const cell = document.createElement('button');
    cell.id = `cell${y}${x}`;
    addClassNamesToCell(cell, board, [y, x]);
    cell.dataset.pos = `${y}${x}`;
    boardDom.appendChild(cell);
  });

  pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().subscribe(_eventTypes__WEBPACK_IMPORTED_MODULE_1__["default"].UPDATE_BOARD, updateBoard);
  return boardDom;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createDOMBoard);


/***/ }),

/***/ "./src/eventTypes.js":
/*!***************************!*\
  !*** ./src/eventTypes.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const eventTypes = {
  NEXT_TURN: 'next turn',
  UPDATE_UI: 'update ui',
  MOVE_INPUT: 'move input',
  PLAYER_MOVE: 'player move',
  UPDATE_BOARD: 'update board',
  GAME_START: 'game start',
  GAME_END: 'game end',
};

Object.freeze(eventTypes);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (eventTypes);


/***/ }),

/***/ "./src/helperFuncs.js":
/*!****************************!*\
  !*** ./src/helperFuncs.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "randomElement": () => (/* binding */ randomElement),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const randomElement = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ randomElement });


/***/ }),

/***/ "./src/shipFactory.js":
/*!****************************!*\
  !*** ./src/shipFactory.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const shipFactory = ({
  startPos = [0, 0],
  length = 1,
  orientation = [0, 1],
} = {}) => {
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (shipFactory);


/***/ }),

/***/ "./src/startPage.js":
/*!**************************!*\
  !*** ./src/startPage.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pubsub-js */ "./node_modules/pubsub-js/src/pubsub.js");
/* harmony import */ var pubsub_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pubsub_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _eventTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eventTypes */ "./src/eventTypes.js");
/* harmony import */ var _boardFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boardFactory */ "./src/boardFactory.js");
/* harmony import */ var _shipFactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shipFactory */ "./src/shipFactory.js");
/* harmony import */ var _createBattleships__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./createBattleships */ "./src/createBattleships.js");
/* harmony import */ var _createDOMBoard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./createDOMBoard */ "./src/createDOMBoard.js");







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
    const ship = (0,_shipFactory__WEBPACK_IMPORTED_MODULE_3__["default"])({ startPos, orientation, length: shipLength });

    if (initBoard.canShipBeAdded(ship)) {
      initBoard.addShip(ship);
      selectedShip.remove();
      pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish(_eventTypes__WEBPACK_IMPORTED_MODULE_1__["default"].UPDATE_BOARD, dom.board);
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

    pubsub_js__WEBPACK_IMPORTED_MODULE_0___default().publish(_eventTypes__WEBPACK_IMPORTED_MODULE_1__["default"].GAME_START, { ships: initBoard.ships });
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
  const initBoard = (0,_boardFactory__WEBPACK_IMPORTED_MODULE_2__["default"])();
  const ships = (0,_createBattleships__WEBPACK_IMPORTED_MODULE_4__["default"])();
  const dom = {
    parent: document.getElementById('start'),
    boardWrapper: document.getElementById('board-wrapper'),
    shipsWrapper: document.getElementById('ships-wrapper'),
    startBtn: document.getElementById('start'),
    changeOrientationBtn: document.getElementById('change-orientation'),
    board: (0,_createDOMBoard__WEBPACK_IMPORTED_MODULE_5__["default"])(initBoard),
    ships: createDOMShips(ships),
  };

  addBoardAndShipsToDom();
  addEventListeners();
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startPage);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _startPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startPage */ "./src/startPage.js");


(0,_startPage__WEBPACK_IMPORTED_MODULE_0__["default"])();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7Ozs7Ozs7Ozs7QUNKb0M7QUFDcEM7QUFDQSxzREFBUyIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvcHVic3ViLWpzL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9ib2FyZEZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9jcmVhdGVCYXR0bGVzaGlwcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2NyZWF0ZURPTUJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZXZlbnRUeXBlcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2hlbHBlckZ1bmNzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcEZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9zdGFydFBhZ2UuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbm9kZSBtb2R1bGUgZGVjb3JhdG9yIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAsMjAxMSwyMDEyLDIwMTMsMjAxNCBNb3JnYW4gUm9kZXJpY2sgaHR0cDovL3JvZGVyaWNrLmRrXG4gKiBMaWNlbnNlOiBNSVQgLSBodHRwOi8vbXJnbnJkcmNrLm1pdC1saWNlbnNlLm9yZ1xuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tcm9kZXJpY2svUHViU3ViSlNcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBQdWJTdWIgPSB7fTtcblxuICAgIGlmIChyb290LlB1YlN1Yikge1xuICAgICAgICBQdWJTdWIgPSByb290LlB1YlN1YjtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUHViU3ViIGFscmVhZHkgbG9hZGVkLCB1c2luZyBleGlzdGluZyB2ZXJzaW9uXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuUHViU3ViID0gUHViU3ViO1xuICAgICAgICBmYWN0b3J5KFB1YlN1Yik7XG4gICAgfVxuICAgIC8vIENvbW1vbkpTIGFuZCBOb2RlLmpzIG1vZHVsZSBzdXBwb3J0XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIGlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gUHViU3ViOyAvLyBOb2RlLmpzIHNwZWNpZmljIGBtb2R1bGUuZXhwb3J0c2BcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRzLlB1YlN1YiA9IFB1YlN1YjsgLy8gQ29tbW9uSlMgbW9kdWxlIDEuMS4xIHNwZWNcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUHViU3ViOyAvLyBDb21tb25KU1xuICAgIH1cbiAgICAvLyBBTUQgc3VwcG9ydFxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKXtcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gUHViU3ViOyB9KTtcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgIH1cblxufSgoIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdyApIHx8IHRoaXMsIGZ1bmN0aW9uIChQdWJTdWIpe1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBtZXNzYWdlcyA9IHt9LFxuICAgICAgICBsYXN0VWlkID0gLTEsXG4gICAgICAgIEFMTF9TVUJTQ1JJQklOR19NU0cgPSAnKic7XG5cbiAgICBmdW5jdGlvbiBoYXNLZXlzKG9iail7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKXtcbiAgICAgICAgICAgIGlmICggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB0aHJvd3MgdGhlIHBhc3NlZCBleGNlcHRpb24sIGZvciB1c2UgYXMgYXJndW1lbnQgZm9yIHNldFRpbWVvdXRcbiAgICAgKiBAYWxpYXMgdGhyb3dFeGNlcHRpb25cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyBPYmplY3QgfSBleCBBbiBFcnJvciBvYmplY3RcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0aHJvd0V4Y2VwdGlvbiggZXggKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlVGhyb3dFeGNlcHRpb24oKXtcbiAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aERlbGF5ZWRFeGNlcHRpb25zKCBzdWJzY3JpYmVyLCBtZXNzYWdlLCBkYXRhICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyKCBtZXNzYWdlLCBkYXRhICk7XG4gICAgICAgIH0gY2F0Y2goIGV4ICl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCB0aHJvd0V4Y2VwdGlvbiggZXggKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsU3Vic2NyaWJlcldpdGhJbW1lZGlhdGVFeGNlcHRpb25zKCBzdWJzY3JpYmVyLCBtZXNzYWdlLCBkYXRhICl7XG4gICAgICAgIHN1YnNjcmliZXIoIG1lc3NhZ2UsIGRhdGEgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWxpdmVyTWVzc2FnZSggb3JpZ2luYWxNZXNzYWdlLCBtYXRjaGVkTWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuICAgICAgICB2YXIgc3Vic2NyaWJlcnMgPSBtZXNzYWdlc1ttYXRjaGVkTWVzc2FnZV0sXG4gICAgICAgICAgICBjYWxsU3Vic2NyaWJlciA9IGltbWVkaWF0ZUV4Y2VwdGlvbnMgPyBjYWxsU3Vic2NyaWJlcldpdGhJbW1lZGlhdGVFeGNlcHRpb25zIDogY2FsbFN1YnNjcmliZXJXaXRoRGVsYXllZEV4Y2VwdGlvbnMsXG4gICAgICAgICAgICBzO1xuXG4gICAgICAgIGlmICggIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCggbWVzc2FnZXMsIG1hdGNoZWRNZXNzYWdlICkgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHMgaW4gc3Vic2NyaWJlcnMpe1xuICAgICAgICAgICAgaWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3Vic2NyaWJlcnMsIHMpKXtcbiAgICAgICAgICAgICAgICBjYWxsU3Vic2NyaWJlciggc3Vic2NyaWJlcnNbc10sIG9yaWdpbmFsTWVzc2FnZSwgZGF0YSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVsaXZlcnlGdW5jdGlvbiggbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZGVsaXZlck5hbWVzcGFjZWQoKXtcbiAgICAgICAgICAgIHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoICcuJyApO1xuXG4gICAgICAgICAgICAvLyBkZWxpdmVyIHRoZSBtZXNzYWdlIGFzIGl0IGlzIG5vd1xuICAgICAgICAgICAgZGVsaXZlck1lc3NhZ2UobWVzc2FnZSwgbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHRyaW0gdGhlIGhpZXJhcmNoeSBhbmQgZGVsaXZlciBtZXNzYWdlIHRvIGVhY2ggbGV2ZWxcbiAgICAgICAgICAgIHdoaWxlKCBwb3NpdGlvbiAhPT0gLTEgKXtcbiAgICAgICAgICAgICAgICB0b3BpYyA9IHRvcGljLnN1YnN0ciggMCwgcG9zaXRpb24gKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgICAgICAgICAgZGVsaXZlck1lc3NhZ2UoIG1lc3NhZ2UsIHRvcGljLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlbGl2ZXJNZXNzYWdlKG1lc3NhZ2UsIEFMTF9TVUJTQ1JJQklOR19NU0csIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc0RpcmVjdFN1YnNjcmliZXJzRm9yKCBtZXNzYWdlICkge1xuICAgICAgICB2YXIgdG9waWMgPSBTdHJpbmcoIG1lc3NhZ2UgKSxcbiAgICAgICAgICAgIGZvdW5kID0gQm9vbGVhbihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIG1lc3NhZ2VzLCB0b3BpYyApICYmIGhhc0tleXMobWVzc2FnZXNbdG9waWNdKSk7XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1lc3NhZ2VIYXNTdWJzY3JpYmVycyggbWVzc2FnZSApe1xuICAgICAgICB2YXIgdG9waWMgPSBTdHJpbmcoIG1lc3NhZ2UgKSxcbiAgICAgICAgICAgIGZvdW5kID0gaGFzRGlyZWN0U3Vic2NyaWJlcnNGb3IodG9waWMpIHx8IGhhc0RpcmVjdFN1YnNjcmliZXJzRm9yKEFMTF9TVUJTQ1JJQklOR19NU0cpLFxuICAgICAgICAgICAgcG9zaXRpb24gPSB0b3BpYy5sYXN0SW5kZXhPZiggJy4nICk7XG5cbiAgICAgICAgd2hpbGUgKCAhZm91bmQgJiYgcG9zaXRpb24gIT09IC0xICl7XG4gICAgICAgICAgICB0b3BpYyA9IHRvcGljLnN1YnN0ciggMCwgcG9zaXRpb24gKTtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoICcuJyApO1xuICAgICAgICAgICAgZm91bmQgPSBoYXNEaXJlY3RTdWJzY3JpYmVyc0Zvcih0b3BpYyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHVibGlzaCggbWVzc2FnZSwgZGF0YSwgc3luYywgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuICAgICAgICBtZXNzYWdlID0gKHR5cGVvZiBtZXNzYWdlID09PSAnc3ltYm9sJykgPyBtZXNzYWdlLnRvU3RyaW5nKCkgOiBtZXNzYWdlO1xuXG4gICAgICAgIHZhciBkZWxpdmVyID0gY3JlYXRlRGVsaXZlcnlGdW5jdGlvbiggbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApLFxuICAgICAgICAgICAgaGFzU3Vic2NyaWJlcnMgPSBtZXNzYWdlSGFzU3Vic2NyaWJlcnMoIG1lc3NhZ2UgKTtcblxuICAgICAgICBpZiAoICFoYXNTdWJzY3JpYmVycyApe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBzeW5jID09PSB0cnVlICl7XG4gICAgICAgICAgICBkZWxpdmVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBkZWxpdmVyLCAwICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIHRoZSBtZXNzYWdlLCBwYXNzaW5nIHRoZSBkYXRhIHRvIGl0J3Mgc3Vic2NyaWJlcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYWxpYXMgcHVibGlzaFxuICAgICAqIEBwYXJhbSB7IFN0cmluZyB9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gcHVibGlzaFxuICAgICAqIEBwYXJhbSB7fSBkYXRhIFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcbiAgICAgKiBAcmV0dXJuIHsgQm9vbGVhbiB9XG4gICAgICovXG4gICAgUHViU3ViLnB1Ymxpc2ggPSBmdW5jdGlvbiggbWVzc2FnZSwgZGF0YSApe1xuICAgICAgICByZXR1cm4gcHVibGlzaCggbWVzc2FnZSwgZGF0YSwgZmFsc2UsIFB1YlN1Yi5pbW1lZGlhdGVFeGNlcHRpb25zICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyB0aGUgbWVzc2FnZSBzeW5jaHJvbm91c2x5LCBwYXNzaW5nIHRoZSBkYXRhIHRvIGl0J3Mgc3Vic2NyaWJlcnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYWxpYXMgcHVibGlzaFN5bmNcbiAgICAgKiBAcGFyYW0geyBTdHJpbmcgfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIHB1Ymxpc2hcbiAgICAgKiBAcGFyYW0ge30gZGF0YSBUaGUgZGF0YSB0byBwYXNzIHRvIHN1YnNjcmliZXJzXG4gICAgICogQHJldHVybiB7IEJvb2xlYW4gfVxuICAgICAqL1xuICAgIFB1YlN1Yi5wdWJsaXNoU3luYyA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBkYXRhICl7XG4gICAgICAgIHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCB0cnVlLCBQdWJTdWIuaW1tZWRpYXRlRXhjZXB0aW9ucyApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRoZSBwYXNzZWQgZnVuY3Rpb24gdG8gdGhlIHBhc3NlZCBtZXNzYWdlLiBFdmVyeSByZXR1cm5lZCB0b2tlbiBpcyB1bmlxdWUgYW5kIHNob3VsZCBiZSBzdG9yZWQgaWYgeW91IG5lZWQgdG8gdW5zdWJzY3JpYmVcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYWxpYXMgc3Vic2NyaWJlXG4gICAgICogQHBhcmFtIHsgU3RyaW5nIH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBzdWJzY3JpYmUgdG9cbiAgICAgKiBAcGFyYW0geyBGdW5jdGlvbiB9IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIG5ldyBtZXNzYWdlIGlzIHB1Ymxpc2hlZFxuICAgICAqIEByZXR1cm4geyBTdHJpbmcgfVxuICAgICAqL1xuICAgIFB1YlN1Yi5zdWJzY3JpYmUgPSBmdW5jdGlvbiggbWVzc2FnZSwgZnVuYyApe1xuICAgICAgICBpZiAoIHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lc3NhZ2UgPSAodHlwZW9mIG1lc3NhZ2UgPT09ICdzeW1ib2wnKSA/IG1lc3NhZ2UudG9TdHJpbmcoKSA6IG1lc3NhZ2U7XG5cbiAgICAgICAgLy8gbWVzc2FnZSBpcyBub3QgcmVnaXN0ZXJlZCB5ZXRcbiAgICAgICAgaWYgKCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCBtZXNzYWdlcywgbWVzc2FnZSApICl7XG4gICAgICAgICAgICBtZXNzYWdlc1ttZXNzYWdlXSA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yY2luZyB0b2tlbiBhcyBTdHJpbmcsIHRvIGFsbG93IGZvciBmdXR1cmUgZXhwYW5zaW9ucyB3aXRob3V0IGJyZWFraW5nIHVzYWdlXG4gICAgICAgIC8vIGFuZCBhbGxvdyBmb3IgZWFzeSB1c2UgYXMga2V5IG5hbWVzIGZvciB0aGUgJ21lc3NhZ2VzJyBvYmplY3RcbiAgICAgICAgdmFyIHRva2VuID0gJ3VpZF8nICsgU3RyaW5nKCsrbGFzdFVpZCk7XG4gICAgICAgIG1lc3NhZ2VzW21lc3NhZ2VdW3Rva2VuXSA9IGZ1bmM7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRva2VuIGZvciB1bnN1YnNjcmliaW5nXG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9O1xuXG4gICAgUHViU3ViLnN1YnNjcmliZUFsbCA9IGZ1bmN0aW9uKCBmdW5jICl7XG4gICAgICAgIHJldHVybiBQdWJTdWIuc3Vic2NyaWJlKEFMTF9TVUJTQ1JJQklOR19NU0csIGZ1bmMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRoZSBwYXNzZWQgZnVuY3Rpb24gdG8gdGhlIHBhc3NlZCBtZXNzYWdlIG9uY2VcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYWxpYXMgc3Vic2NyaWJlT25jZVxuICAgICAqIEBwYXJhbSB7IFN0cmluZyB9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gc3Vic2NyaWJlIHRvXG4gICAgICogQHBhcmFtIHsgRnVuY3Rpb24gfSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYSBuZXcgbWVzc2FnZSBpcyBwdWJsaXNoZWRcbiAgICAgKiBAcmV0dXJuIHsgUHViU3ViIH1cbiAgICAgKi9cbiAgICBQdWJTdWIuc3Vic2NyaWJlT25jZSA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBmdW5jICl7XG4gICAgICAgIHZhciB0b2tlbiA9IFB1YlN1Yi5zdWJzY3JpYmUoIG1lc3NhZ2UsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAvLyBiZWZvcmUgZnVuYyBhcHBseSwgdW5zdWJzY3JpYmUgbWVzc2FnZVxuICAgICAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKCB0b2tlbiApO1xuICAgICAgICAgICAgZnVuYy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUHViU3ViO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIHN1YnNjcmlwdGlvbnNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQGFsaWFzIGNsZWFyQWxsU3Vic2NyaXB0aW9uc1xuICAgICAqL1xuICAgIFB1YlN1Yi5jbGVhckFsbFN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBjbGVhckFsbFN1YnNjcmlwdGlvbnMoKXtcbiAgICAgICAgbWVzc2FnZXMgPSB7fTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgc3Vic2NyaXB0aW9ucyBieSB0aGUgdG9waWNcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQGFsaWFzIGNsZWFyQWxsU3Vic2NyaXB0aW9uc1xuICAgICAqIEByZXR1cm4geyBpbnQgfVxuICAgICAqL1xuICAgIFB1YlN1Yi5jbGVhclN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBjbGVhclN1YnNjcmlwdGlvbnModG9waWMpe1xuICAgICAgICB2YXIgbTtcbiAgICAgICAgZm9yIChtIGluIG1lc3NhZ2VzKXtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZXMsIG0pICYmIG0uaW5kZXhPZih0b3BpYykgPT09IDApe1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNzYWdlc1ttXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgICBDb3VudCBzdWJzY3JpcHRpb25zIGJ5IHRoZSB0b3BpY1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAYWxpYXMgY291bnRTdWJzY3JpcHRpb25zXG4gICAgICogQHJldHVybiB7IEFycmF5IH1cbiAgICAqL1xuICAgIFB1YlN1Yi5jb3VudFN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBjb3VudFN1YnNjcmlwdGlvbnModG9waWMpe1xuICAgICAgICB2YXIgbTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIHZhciB0b2tlbjtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChtIGluIG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1lc3NhZ2VzLCBtKSAmJiBtLmluZGV4T2YodG9waWMpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh0b2tlbiBpbiBtZXNzYWdlc1ttXSkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICAgR2V0cyBzdWJzY3JpcHRpb25zIGJ5IHRoZSB0b3BpY1xuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAYWxpYXMgZ2V0U3Vic2NyaXB0aW9uc1xuICAgICovXG4gICAgUHViU3ViLmdldFN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBnZXRTdWJzY3JpcHRpb25zKHRvcGljKXtcbiAgICAgICAgdmFyIG07XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIGZvciAobSBpbiBtZXNzYWdlcyl7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1lc3NhZ2VzLCBtKSAmJiBtLmluZGV4T2YodG9waWMpID09PSAwKXtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2gobSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgc3Vic2NyaXB0aW9uc1xuICAgICAqXG4gICAgICogLSBXaGVuIHBhc3NlZCBhIHRva2VuLCByZW1vdmVzIGEgc3BlY2lmaWMgc3Vic2NyaXB0aW9uLlxuICAgICAqXG5cdCAqIC0gV2hlbiBwYXNzZWQgYSBmdW5jdGlvbiwgcmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBmb3IgdGhhdCBmdW5jdGlvblxuICAgICAqXG5cdCAqIC0gV2hlbiBwYXNzZWQgYSB0b3BpYywgcmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBmb3IgdGhhdCB0b3BpYyAoaGllcmFyY2h5KVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAYWxpYXMgc3Vic2NyaWJlT25jZVxuICAgICAqIEBwYXJhbSB7IFN0cmluZyB8IEZ1bmN0aW9uIH0gdmFsdWUgQSB0b2tlbiwgZnVuY3Rpb24gb3IgdG9waWMgdG8gdW5zdWJzY3JpYmUgZnJvbVxuICAgICAqIEBleGFtcGxlIC8vIFVuc3Vic2NyaWJpbmcgd2l0aCBhIHRva2VuXG4gICAgICogdmFyIHRva2VuID0gUHViU3ViLnN1YnNjcmliZSgnbXl0b3BpYycsIG15RnVuYyk7XG4gICAgICogUHViU3ViLnVuc3Vic2NyaWJlKHRva2VuKTtcbiAgICAgKiBAZXhhbXBsZSAvLyBVbnN1YnNjcmliaW5nIHdpdGggYSBmdW5jdGlvblxuICAgICAqIFB1YlN1Yi51bnN1YnNjcmliZShteUZ1bmMpO1xuICAgICAqIEBleGFtcGxlIC8vIFVuc3Vic2NyaWJpbmcgZnJvbSBhIHRvcGljXG4gICAgICogUHViU3ViLnVuc3Vic2NyaWJlKCdteXRvcGljJyk7XG4gICAgICovXG4gICAgUHViU3ViLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICB2YXIgZGVzY2VuZGFudFRvcGljRXhpc3RzID0gZnVuY3Rpb24odG9waWMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbTtcbiAgICAgICAgICAgICAgICBmb3IgKCBtIGluIG1lc3NhZ2VzICl7XG4gICAgICAgICAgICAgICAgICAgIGlmICggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1lc3NhZ2VzLCBtKSAmJiBtLmluZGV4T2YodG9waWMpID09PSAwICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhIGRlc2NlbmRhbnQgb2YgdGhlIHRvcGljIGV4aXN0czpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzVG9waWMgICAgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1lc3NhZ2VzLCB2YWx1ZSkgfHwgZGVzY2VuZGFudFRvcGljRXhpc3RzKHZhbHVlKSApLFxuICAgICAgICAgICAgaXNUb2tlbiAgICA9ICFpc1RvcGljICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgICAgICAgICBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2UsXG4gICAgICAgICAgICBtLCBtZXNzYWdlLCB0O1xuXG4gICAgICAgIGlmIChpc1RvcGljKXtcbiAgICAgICAgICAgIFB1YlN1Yi5jbGVhclN1YnNjcmlwdGlvbnModmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggbSBpbiBtZXNzYWdlcyApe1xuICAgICAgICAgICAgaWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIG1lc3NhZ2VzLCBtICkgKXtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZXNbbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoIGlzVG9rZW4gJiYgbWVzc2FnZVt2YWx1ZV0gKXtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc3NhZ2VbdmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5zIGFyZSB1bmlxdWUsIHNvIHdlIGNhbiBqdXN0IHN0b3AgaGVyZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCB0IGluIG1lc3NhZ2UgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWVzc2FnZSwgdCkgJiYgbWVzc2FnZVt0XSA9PT0gdmFsdWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNzYWdlW3RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59KSk7XG4iLCJpbXBvcnQgeyByYW5kb21FbGVtZW50IH0gZnJvbSAnLi9oZWxwZXJGdW5jcyc7XHJcbmltcG9ydCBzaGlwRmFjdG9yeSBmcm9tICcuL3NoaXBGYWN0b3J5JztcclxuXHJcbmNvbnN0IERFRkFVTFRfV0lEVEggPSAxMDtcclxuY29uc3QgREVGQVVMVF9IRUlHSFQgPSAxMDtcclxuXHJcbmNvbnN0IGJvYXJkRmFjdG9yeSA9ICh7XHJcbiAgc2hpcHMgPSBbXSxcclxuICB3aWR0aCA9IERFRkFVTFRfV0lEVEgsXHJcbiAgaGVpZ2h0ID0gREVGQVVMVF9IRUlHSFQsXHJcbn0gPSB7fSkgPT4ge1xyXG4gIGNvbnN0IGdlbkFsbEJvYXJkSW5kaWNlcyA9ICgpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkgKz0gMSkge1xyXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4ICs9IDEpIHtcclxuICAgICAgICByZXN1bHQucHVzaChbeSwgeF0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdldEFsbFNoaXBzUG9zaXRpb25zID0gKGJvYXJkU2hpcHMpID0+XHJcbiAgICBib2FyZFNoaXBzLnJlZHVjZShcclxuICAgICAgKHBvc2l0aW9ucywgc2hpcCkgPT4gcG9zaXRpb25zLmNvbmNhdChzaGlwLnBvc2l0aW9ucyksXHJcbiAgICAgIFtdXHJcbiAgICApO1xyXG5cclxuICBjb25zdCBpc1NoaXBzT3ZlcmxhcHBpbmcgPSAocG9zaXRpb25zKSA9PiB7XHJcbiAgICBjb25zdCBjaGVja2VkUG9zaXRpb25zID0ge307XHJcbiAgICByZXR1cm4gIXBvc2l0aW9ucy5ldmVyeSgoZSkgPT4ge1xyXG4gICAgICBpZiAoY2hlY2tlZFBvc2l0aW9uc1tlXSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgY2hlY2tlZFBvc2l0aW9uc1tlXSA9IHRydWU7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaXNQb3NJbkJvdW5kcyA9IChbeSwgeF0pID0+IHggPCB3aWR0aCAmJiB5IDwgaGVpZ2h0ICYmIHggPj0gMCAmJiB5ID49IDA7XHJcblxyXG4gIGNvbnN0IGlzU2hpcHNPdXRPZkJvdW5kcyA9IChwb3NpdGlvbnMpID0+ICFwb3NpdGlvbnMuZXZlcnkoaXNQb3NJbkJvdW5kcyk7XHJcblxyXG4gIGNvbnN0IGlzU2hpcHNWYWxpZCA9IChib2FyZFNoaXBzKSA9PiB7XHJcbiAgICBjb25zdCBzaGlwc1Bvc2l0aW9ucyA9IGdldEFsbFNoaXBzUG9zaXRpb25zKGJvYXJkU2hpcHMpO1xyXG4gICAgcmV0dXJuICEoXHJcbiAgICAgIGlzU2hpcHNPdXRPZkJvdW5kcyhzaGlwc1Bvc2l0aW9ucykgfHwgaXNTaGlwc092ZXJsYXBwaW5nKHNoaXBzUG9zaXRpb25zKVxyXG4gICAgKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBjYW5TaGlwQmVBZGRlZCA9IChzaGlwKSA9PiB7XHJcbiAgICBjb25zdCBib2FyZFNoaXBzID0gWy4uLnNoaXBzLCBzaGlwXTtcclxuICAgIHJldHVybiBpc1NoaXBzVmFsaWQoYm9hcmRTaGlwcyk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdmFsaWRhdGVTaGlwcyA9ICgpID0+IHtcclxuICAgIGlmICghaXNTaGlwc1ZhbGlkKHNoaXBzKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNoaXAgcGxhY2VtZW50cycpO1xyXG4gIH07XHJcblxyXG4gIHZhbGlkYXRlU2hpcHMoKTtcclxuXHJcbiAgY29uc3QgYXR0YWNrZWRQb3NpdGlvbnMgPSBbXTtcclxuXHJcbiAgY29uc3QgaGFzUG9zQmVlbkF0dGFja2VkID0gKFt5LCB4XSkgPT5cclxuICAgIGF0dGFja2VkUG9zaXRpb25zLnNvbWUoKHBvcykgPT4gcG9zWzBdID09PSB5ICYmIHBvc1sxXSA9PT0geCk7XHJcblxyXG4gIGNvbnN0IGlzQXR0YWNrVmFsaWQgPSAoW3ksIHhdKSA9PlxyXG4gICAgaXNQb3NJbkJvdW5kcyhbeSwgeF0pICYmICFoYXNQb3NCZWVuQXR0YWNrZWQoW3ksIHhdKTtcclxuXHJcbiAgY29uc3QgcmVjZWl2ZUF0dGFjayA9IChbeSwgeF0pID0+IHtcclxuICAgIGlmICghaXNBdHRhY2tWYWxpZChbeSwgeF0pKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQXR0YWNrJyk7XHJcblxyXG4gICAgYXR0YWNrZWRQb3NpdGlvbnMucHVzaChbeSwgeF0pO1xyXG4gICAgY29uc3QgYXR0YWNrZWRTaGlwID0gc2hpcHMuZmlsdGVyKChzaGlwKSA9PiBzaGlwLmlzUG9zKFt5LCB4XSkpWzBdO1xyXG4gICAgaWYgKCFhdHRhY2tlZFNoaXApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBhdHRhY2tlZFNoaXAucmVjZWl2ZUF0dGFjayhbeSwgeF0pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgYWRkU2hpcCA9IChzaGlwKSA9PiB7XHJcbiAgICBjb25zdCB1cGRhdGVkU2hpcFBvc2l0aW9ucyA9IGdldEFsbFNoaXBzUG9zaXRpb25zKFsuLi5zaGlwcywgc2hpcF0pO1xyXG4gICAgaWYgKFxyXG4gICAgICBpc1NoaXBzT3ZlcmxhcHBpbmcodXBkYXRlZFNoaXBQb3NpdGlvbnMpIHx8XHJcbiAgICAgIGlzU2hpcHNPdXRPZkJvdW5kcyh1cGRhdGVkU2hpcFBvc2l0aW9ucylcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2hpcHMucHVzaChzaGlwKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHN1bmtTaGlwcyA9ICgpID0+IHNoaXBzLmZpbHRlcigoc2hpcCkgPT4gc2hpcC5pc1N1bmsoKSk7XHJcblxyXG4gIGNvbnN0IGlzQWxsU2hpcHNTdW5rID0gKCkgPT4gc3Vua1NoaXBzKCkubGVuZ3RoID09PSBzaGlwcy5sZW5ndGg7XHJcblxyXG4gIGNvbnN0IGlzQWxsUG9zaXRpb25zQXR0YWNrZWQgPSAoKSA9PiBhdHRhY2tlZFBvc2l0aW9ucy5sZW5ndGggPT09IGFsbEluZGljZXMubGVuZ3RoO1xyXG5cclxuICBjb25zdCBhbGxJbmRpY2VzID0gT2JqZWN0LmZyZWV6ZShnZW5BbGxCb2FyZEluZGljZXMoKSk7XHJcblxyXG4gIGNvbnN0IGZvck9wcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNoYWRvd1xyXG4gICAgY29uc3QgeyBzaGlwcywgcmVjZWl2ZUF0dGFjaywgYWRkU2hpcCwgLi4ucmVzdCB9ID0gc2VsZjtcclxuICAgIHJlc3Quc2hpcHMgPSBbXTtcclxuICAgIHJldHVybiByZXN0O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNlbGYgPSB7XHJcbiAgICBzaGlwcyxcclxuICAgIHdpZHRoLFxyXG4gICAgaGVpZ2h0LFxyXG4gICAgYWxsSW5kaWNlcyxcclxuICAgIGF0dGFja2VkUG9zaXRpb25zLFxyXG4gICAgaXNBdHRhY2tWYWxpZCxcclxuICAgIHJlY2VpdmVBdHRhY2ssXHJcbiAgICBoYXNQb3NCZWVuQXR0YWNrZWQsXHJcbiAgICBpc0FsbFBvc2l0aW9uc0F0dGFja2VkLFxyXG4gICAgc3Vua1NoaXBzLFxyXG4gICAgaXNBbGxTaGlwc1N1bmssXHJcbiAgICBhZGRTaGlwLFxyXG4gICAgY2FuU2hpcEJlQWRkZWQsXHJcbiAgICBmb3JPcHBvbmVudCxcclxuICB9O1xyXG5cclxuICByZXR1cm4gc2VsZjtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGJvYXJkRmFjdG9yeTtcclxuIiwiaW1wb3J0IHNoaXBGYWN0b3J5IGZyb20gJy4vc2hpcEZhY3RvcnknO1xyXG5cclxuY29uc3QgY3JlYXRlQmF0dGxlc2hpcHMgPSAoKSA9PlxyXG4gIFs1LCA0LCAzLCAzLCAyXS5tYXAoKGxlbmd0aCkgPT4gc2hpcEZhY3RvcnkoeyBsZW5ndGggfSkpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmF0dGxlc2hpcHM7XHJcbiIsImltcG9ydCBQdWJTdWIgZnJvbSAncHVic3ViLWpzJztcclxuaW1wb3J0IGV2ZW50VHlwZXMgZnJvbSAnLi9ldmVudFR5cGVzJztcclxuXHJcbmNvbnN0IGlzU2hpcFBvcyA9IChib2FyZCwgcG9zKSA9PiB7XHJcbiAgYm9hcmQuc2hpcHMuc29tZSgoc2hpcCkgPT4gc2hpcC5pc1Bvcyhwb3MpKTtcclxufTtcclxuXHJcbmNvbnN0IGFkZENsYXNzTmFtZXNUb0NlbGwgPSAoY2VsbCwgYm9hcmQsIHBvcykgPT4ge1xyXG4gIGNlbGwuY2xhc3NMaXN0LmFkZCgnYm9hcmRfX2NlbGwnKTtcclxuXHJcbiAgaWYgKGJvYXJkLmhhc1Bvc0JlZW5BdHRhY2tlZChwb3MpKSB7XHJcbiAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ2JvYXJkX19jZWxsLS1hdHRhY2tlZCcpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGlzU2hpcFBvcyhib2FyZCwgcG9zKSkge1xyXG4gICAgY2VsbC5jbGFzc0xpc3QuYWRkKCdib2FyZF9fY2VsbC0tc2hpcCcpO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZURPTUJvYXJkID0gKGJvYXJkKSA9PiB7XHJcbiAgY29uc3QgdXBkYXRlQm9hcmQgPSAoXywgZGF0YSkgPT4ge1xyXG4gICAgaWYgKGRhdGEgIT09IGJvYXJkRG9tKSByZXR1cm47XHJcblxyXG4gICAgYm9hcmQuYXR0YWNrZWRQb3NpdGlvbnMuZm9yRWFjaCgoW3ksIHhdKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNlbGxTZWxlY3RvciA9IGBbZGF0YSA9XCIke3l9JHt4fVwiXWA7XHJcbiAgICAgIGNvbnN0IGNlbGwgPSBib2FyZERvbS5xdWVyeVNlbGVjdG9yKGNlbGxTZWxlY3Rvcik7XHJcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnYm9hcmRfX2NlbGwtLWF0dGFja2VkJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBzaGlwc1BvcyA9IGJvYXJkLnNoaXBzLnJlZHVjZSgoYWNjLCBzaGlwKSA9PiBhY2MuY29uY2F0KHNoaXAucG9zaXRpb25zKSwgW10pO1xyXG4gICAgc2hpcHNQb3MuZm9yRWFjaCgoW3ksIHhdKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNlbGxTZWxlY3RvciA9IGBbZGF0YS1wb3M9XCIke3l9JHt4fVwiXWA7XHJcbiAgICAgIGNvbnN0IGNlbGwgPSBib2FyZERvbS5xdWVyeVNlbGVjdG9yKGNlbGxTZWxlY3Rvcik7XHJcbiAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnYm9hcmRfX2NlbGwtLXNoaXAnKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGJvYXJkRG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgYm9hcmREb20uY2xhc3NOYW1lID0gJ2JvYXJkJztcclxuXHJcbiAgYm9hcmQuYWxsSW5kaWNlcy5mb3JFYWNoKChbeSwgeF0pID0+IHtcclxuICAgIGNvbnN0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgIGNlbGwuaWQgPSBgY2VsbCR7eX0ke3h9YDtcclxuICAgIGFkZENsYXNzTmFtZXNUb0NlbGwoY2VsbCwgYm9hcmQsIFt5LCB4XSk7XHJcbiAgICBjZWxsLmRhdGFzZXQucG9zID0gYCR7eX0ke3h9YDtcclxuICAgIGJvYXJkRG9tLmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gIH0pO1xyXG5cclxuICBQdWJTdWIuc3Vic2NyaWJlKGV2ZW50VHlwZXMuVVBEQVRFX0JPQVJELCB1cGRhdGVCb2FyZCk7XHJcbiAgcmV0dXJuIGJvYXJkRG9tO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlRE9NQm9hcmQ7XHJcbiIsImNvbnN0IGV2ZW50VHlwZXMgPSB7XHJcbiAgTkVYVF9UVVJOOiAnbmV4dCB0dXJuJyxcclxuICBVUERBVEVfVUk6ICd1cGRhdGUgdWknLFxyXG4gIE1PVkVfSU5QVVQ6ICdtb3ZlIGlucHV0JyxcclxuICBQTEFZRVJfTU9WRTogJ3BsYXllciBtb3ZlJyxcclxuICBVUERBVEVfQk9BUkQ6ICd1cGRhdGUgYm9hcmQnLFxyXG4gIEdBTUVfU1RBUlQ6ICdnYW1lIHN0YXJ0JyxcclxuICBHQU1FX0VORDogJ2dhbWUgZW5kJyxcclxufTtcclxuXHJcbk9iamVjdC5mcmVlemUoZXZlbnRUeXBlcyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBldmVudFR5cGVzO1xyXG4iLCJjb25zdCByYW5kb21FbGVtZW50ID0gKGFycmF5KSA9PiB7XHJcbiAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpO1xyXG4gIHJldHVybiBhcnJheVtyYW5kb21JbmRleF07XHJcbn07XHJcblxyXG5leHBvcnQgeyByYW5kb21FbGVtZW50IH07XHJcbmV4cG9ydCBkZWZhdWx0IHsgcmFuZG9tRWxlbWVudCB9O1xyXG4iLCJjb25zdCBzaGlwRmFjdG9yeSA9ICh7XHJcbiAgc3RhcnRQb3MgPSBbMCwgMF0sXHJcbiAgbGVuZ3RoID0gMSxcclxuICBvcmllbnRhdGlvbiA9IFswLCAxXSxcclxufSA9IHt9KSA9PiB7XHJcbiAgY29uc3QgaW5pdFBvc2l0aW9ucyA9ICgpID0+IHtcclxuICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtzdGFydFBvc107XHJcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIGNvbnN0IFt4LCB5XSA9IHBvc2l0aW9uc1tpIC0gMV07XHJcbiAgICAgIGNvbnN0IG5leHQgPSBbb3JpZW50YXRpb25bMF0gKyB4LCBvcmllbnRhdGlvblsxXSArIHldO1xyXG4gICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcclxuICB9O1xyXG5cclxuICBjb25zdCBwb3NpdGlvbnMgPSBpbml0UG9zaXRpb25zKCk7XHJcbiAgY29uc3QgYXR0YWNrZWRQb3NpdGlvbnMgPSBbXTtcclxuXHJcbiAgY29uc3QgaXNQb3MgPSAocG9zKSA9PlxyXG4gICAgcG9zaXRpb25zLnNvbWUoKGUpID0+IGVbMF0gPT09IHBvc1swXSAmJiBlWzFdID09PSBwb3NbMV0pO1xyXG5cclxuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKHBvcykgPT4ge1xyXG4gICAgaWYgKCFpc1Bvcyhwb3MpKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgYXR0YWNrZWRQb3NpdGlvbnMucHVzaChwb3MpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaXNTdW5rID0gKCkgPT4gYXR0YWNrZWRQb3NpdGlvbnMubGVuZ3RoID09PSBwb3NpdGlvbnMubGVuZ3RoO1xyXG5cclxuICBjb25zdCBzZWxmID0ge1xyXG4gICAgc3RhcnRQb3MsXHJcbiAgICBsZW5ndGgsXHJcbiAgICBvcmllbnRhdGlvbixcclxuICAgIHBvc2l0aW9ucyxcclxuICAgIGF0dGFja2VkUG9zaXRpb25zLFxyXG4gICAgcmVjZWl2ZUF0dGFjayxcclxuICAgIGlzUG9zLFxyXG4gICAgaXNTdW5rLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBzZWxmO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2hpcEZhY3Rvcnk7XHJcbiIsImltcG9ydCBQdWJTdWIgZnJvbSAncHVic3ViLWpzJztcclxuaW1wb3J0IGV2ZW50VHlwZXMgZnJvbSAnLi9ldmVudFR5cGVzJztcclxuaW1wb3J0IGJvYXJkRmFjdG9yeSBmcm9tICcuL2JvYXJkRmFjdG9yeSc7XHJcbmltcG9ydCBzaGlwRmFjdG9yeSBmcm9tICcuL3NoaXBGYWN0b3J5JztcclxuaW1wb3J0IGNyZWF0ZUJhdHRsZXNoaXBzIGZyb20gJy4vY3JlYXRlQmF0dGxlc2hpcHMnO1xyXG5pbXBvcnQgY3JlYXRlRE9NQm9hcmQgZnJvbSAnLi9jcmVhdGVET01Cb2FyZCc7XHJcblxyXG5jb25zdCBIT1JJWk9OVEFMX09SSUVOVEFUSU9OID0gT2JqZWN0LmZyZWV6ZShbMSwgMF0pO1xyXG5jb25zdCBWRVJUSUNBTF9PUklFTlRBVElPTiA9IE9iamVjdC5mcmVlemUoWzAsIDFdKTtcclxuXHJcbmNvbnN0IGNyZWF0ZURPTVNoaXBzID0gKHNoaXBzKSA9PiB7XHJcbiAgY29uc3Qgc2hpcE5hbWVzID0ge1xyXG4gICAgNTogJ2NhcnJpZXInLFxyXG4gICAgNDogJ2JhdHRsZXNoaXAnLFxyXG4gICAgMzogJ2NydWlzZXInLFxyXG4gICAgMjogJ2Rlc3Ryb3llcicsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHNoaXBzLm1hcCgoc2hpcCkgPT4ge1xyXG4gICAgY29uc3Qgc2hpcERPTSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgY29uc3Qgc2hpcENsYXNzTmFtZSA9IHNoaXBOYW1lc1tzaGlwLmxlbmd0aF07XHJcbiAgICBzaGlwRE9NLmNsYXNzTGlzdC5hZGQoJ3NoaXAnKTtcclxuICAgIHNoaXBET00uY2xhc3NMaXN0LmFkZChzaGlwQ2xhc3NOYW1lKTtcclxuXHJcbiAgICBzaGlwRE9NLmRhdGFzZXQubGVuZ3RoID0gc2hpcC5sZW5ndGg7XHJcbiAgICByZXR1cm4gc2hpcERPTTtcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IHN0YXJ0UGFnZSA9ICgpID0+IHtcclxuICBjb25zdCBhZGRTaGlwID0gKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoc2hpcExlbmd0aCA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdGVkU2hpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwLS1zZWxlY3RlZCcpO1xyXG4gICAgbGV0IHN0YXJ0UG9zID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQucG9zO1xyXG4gICAgc3RhcnRQb3MgPSBzdGFydFBvcy5zcGxpdCgnJykubWFwKChlKSA9PiBOdW1iZXIoZSkpO1xyXG4gICAgY29uc3Qgc2hpcCA9IHNoaXBGYWN0b3J5KHsgc3RhcnRQb3MsIG9yaWVudGF0aW9uLCBsZW5ndGg6IHNoaXBMZW5ndGggfSk7XHJcblxyXG4gICAgaWYgKGluaXRCb2FyZC5jYW5TaGlwQmVBZGRlZChzaGlwKSkge1xyXG4gICAgICBpbml0Qm9hcmQuYWRkU2hpcChzaGlwKTtcclxuICAgICAgc2VsZWN0ZWRTaGlwLnJlbW92ZSgpO1xyXG4gICAgICBQdWJTdWIucHVibGlzaChldmVudFR5cGVzLlVQREFURV9CT0FSRCwgZG9tLmJvYXJkKTtcclxuICAgIH1cclxuXHJcbiAgICBzaGlwTGVuZ3RoID0gbnVsbDtcclxuICAgIHNlbGVjdGVkU2hpcC5jbGFzc0xpc3QucmVtb3ZlKCdzaGlwLS1zZWxlY3RlZCcpO1xyXG5cclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNlbGVjdFNoaXAgPSAoZXZlbnQpID0+IHtcclxuICAgIHNoaXBMZW5ndGggPSBOdW1iZXIoZXZlbnQudGFyZ2V0LmRhdGFzZXQubGVuZ3RoKTtcclxuICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKCdzaGlwLS1zZWxlY3RlZCcpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNoYW5nZU9yaWVudGF0aW9uID0gKCkgPT4ge1xyXG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBIT1JJWk9OVEFMX09SSUVOVEFUSU9OKSB7XHJcbiAgICAgIG9yaWVudGF0aW9uID0gVkVSVElDQUxfT1JJRU5UQVRJT047XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcmllbnRhdGlvbiA9IEhPUklaT05UQUxfT1JJRU5UQVRJT047XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc3RhcnRHYW1lID0gKCkgPT4ge1xyXG4gICAgaWYgKGluaXRCb2FyZC5zaGlwcy5sZW5ndGggIT09IDUpIHJldHVybjtcclxuXHJcbiAgICBQdWJTdWIucHVibGlzaChldmVudFR5cGVzLkdBTUVfU1RBUlQsIHsgc2hpcHM6IGluaXRCb2FyZC5zaGlwcyB9KTtcclxuICB9O1xyXG5cclxuICBjb25zdCBhZGRFdmVudExpc3RlbmVycyA9ICgpID0+IHtcclxuICAgIGRvbS5ib2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZFNoaXApO1xyXG4gICAgZG9tLnNoaXBzLmZvckVhY2goKHNoaXApID0+IHNoaXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RTaGlwKSk7XHJcbiAgICBkb20uc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzdGFydEdhbWUpO1xyXG4gICAgZG9tLmNoYW5nZU9yaWVudGF0aW9uQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2hhbmdlT3JpZW50YXRpb24pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGFkZEJvYXJkQW5kU2hpcHNUb0RvbSA9ICgpID0+IHtcclxuICAgIGRvbS5ib2FyZFdyYXBwZXIuYXBwZW5kQ2hpbGQoZG9tLmJvYXJkKTtcclxuICAgIGRvbS5zaGlwcy5mb3JFYWNoKChzaGlwKSA9PiBkb20uc2hpcHNXcmFwcGVyLmFwcGVuZENoaWxkKHNoaXApKTtcclxuICB9O1xyXG5cclxuICBsZXQgb3JpZW50YXRpb24gPSBIT1JJWk9OVEFMX09SSUVOVEFUSU9OO1xyXG4gIGxldCBzaGlwTGVuZ3RoID0gbnVsbDtcclxuICBjb25zdCBpbml0Qm9hcmQgPSBib2FyZEZhY3RvcnkoKTtcclxuICBjb25zdCBzaGlwcyA9IGNyZWF0ZUJhdHRsZXNoaXBzKCk7XHJcbiAgY29uc3QgZG9tID0ge1xyXG4gICAgcGFyZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKSxcclxuICAgIGJvYXJkV3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvYXJkLXdyYXBwZXInKSxcclxuICAgIHNoaXBzV3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoaXBzLXdyYXBwZXInKSxcclxuICAgIHN0YXJ0QnRuOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKSxcclxuICAgIGNoYW5nZU9yaWVudGF0aW9uQnRuOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhbmdlLW9yaWVudGF0aW9uJyksXHJcbiAgICBib2FyZDogY3JlYXRlRE9NQm9hcmQoaW5pdEJvYXJkKSxcclxuICAgIHNoaXBzOiBjcmVhdGVET01TaGlwcyhzaGlwcyksXHJcbiAgfTtcclxuXHJcbiAgYWRkQm9hcmRBbmRTaGlwc1RvRG9tKCk7XHJcbiAgYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHN0YXJ0UGFnZTtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0bG9hZGVkOiBmYWxzZSxcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG5cdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5ubWQgPSAobW9kdWxlKSA9PiB7XG5cdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdHJldHVybiBtb2R1bGU7XG59OyIsImltcG9ydCBzdGFydFBhZ2UgZnJvbSAnLi9zdGFydFBhZ2UnO1xyXG5cclxuc3RhcnRQYWdlKCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==