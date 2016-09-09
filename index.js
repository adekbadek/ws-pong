/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var path = __webpack_require__(1);
	var http = __webpack_require__(2);

	var express = __webpack_require__(3);
	var app = express();
	var server = http.createServer(app);
	var io = __webpack_require__(4)(server);

	__webpack_require__(5);

	var _PORT_ = process.env.PORT || 3000;
	app.set('port', _PORT_);

	app.set('views', './front');
	app.set('view engine', 'pug');
	app.use(express.static(path.join(__dirname, 'public')));

	app.get('/', function (req, res) {
	  res.render('index');
	});

	var getRandomInt = function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	// primordial initial pos / the state
	var nextConnectedIsLeft = true;
	var playersPos = { playerLeft: 212, playerLeftSpeed: 0, playerRight: 212, playerRightSpeed: 0 };
	var ballPos = { x: 400, y: 250, x_speed: 3, y_speed: 0 };
	var score = { pLeft: 0, pRight: 0 };
	var voters = { pLeft: 0, pRight: 0 };

	var initialPaddleSpeed = 24;
	var paddleSpeed = initialPaddleSpeed;

	var officialPositionBroadcaster = void 0;
	var isOfficialPositionBroadcasterBlurred = void 0;
	var candidates = [];

	var updatePaddleSpeed = function updatePaddleSpeed() {
	  var newPaddleSpeed = 6 / (io.engine.clientsCount / 2);
	  if (newPaddleSpeed !== paddleSpeed && newPaddleSpeed <= initialPaddleSpeed) {
	    paddleSpeed = newPaddleSpeed;
	    console.log('updated paddleSpeed to ' + paddleSpeed);
	  }
	};

	var chooseNewOfficialPositionBroadcaster = function chooseNewOfficialPositionBroadcaster() {
	  if (candidates.length >= 1) {
	    officialPositionBroadcaster = candidates[getRandomInt(0, candidates.length - 1)];
	    console.log('get new OPB');
	  }
	};

	// detect stalling
	var lastBallPos = void 0;
	setInterval(function () {
	  if (lastBallPos === ballPos) {
	    chooseNewOfficialPositionBroadcaster();
	  }
	  lastBallPos = ballPos;
	}, 1000);

	// define events for any new connection
	io.on('connection', function (socket) {
	  // io.emit will emit event to everyone
	  // socket.emit will emit event just to specific connection

	  updatePaddleSpeed();

	  // handle voting on direction
	  socket.on('key-send', function (data) {
	    if (data === 'right-up') {
	      playersPos.playerRight -= paddleSpeed;
	      playersPos.playerRightSpeed = -paddleSpeed;
	    } else if (data === 'right-down') {
	      playersPos.playerRight += paddleSpeed;
	      playersPos.playerRightSpeed = paddleSpeed;
	    } else if (data === 'left-up') {
	      playersPos.playerLeft -= paddleSpeed;
	      playersPos.playerLeftSpeed = -paddleSpeed;
	    } else if (data === 'left-down') {
	      playersPos.playerLeft += paddleSpeed;
	      playersPos.playerLeftSpeed = paddleSpeed;
	    }
	    io.emit('update-players-positions', playersPos);
	  });

	  socket.on('reload-ball-pos', function (data) {
	    if (candidates.length > 0) {
	      chooseNewOfficialPositionBroadcaster();
	    }
	  });

	  socket.on('ball-pos', function (data) {
	    if (data.id === officialPositionBroadcaster) {
	      ballPos = data.ballPos;
	    }
	  });

	  socket.on('score', function (playerId) {
	    score[playerId] += 1;
	    if (score.pRight !== score.pLeft) {
	      var sorted = Object.keys(score).sort(function (a, b) {
	        return score[a] - score[b];
	      });
	      score[sorted[1]] = score[sorted[1]] - score[sorted[0]];
	      score[sorted[0]] = 0;
	    } else {
	      score.pRight = score.pLeft = 0;
	    }
	    io.emit('score', { score: score, voters: voters });
	  });

	  // every second, broadcast official ballPos
	  setInterval(function () {
	    io.emit('set-ball-pos', { ballPos: ballPos, officialPositionBroadcaster: officialPositionBroadcaster });
	  }, 1000);

	  if (Object.keys(io.sockets.sockets).length === 1) {
	    officialPositionBroadcaster = socket.id;
	    // console.log('new OPB', socket.id)
	  } else if (isOfficialPositionBroadcasterBlurred) {
	    officialPositionBroadcaster = socket.id;
	    isOfficialPositionBroadcasterBlurred = false;
	    // console.log('OPB blurred, new OPB', socket.id)
	  } else {
	    // can someday become officialPositionBroadcaster
	    candidates.push(socket.id);
	    // console.log('new candidate', socket.id, candidates)
	  }

	  var thisConnectedIsLeft = nextConnectedIsLeft;
	  thisConnectedIsLeft ? voters.pLeft += 1 : voters.pRight += 1;
	  socket.emit('init-game', { playersPos: playersPos, ballPos: ballPos, thisConnectedIsLeft: thisConnectedIsLeft, score: score, id: socket.id, voters: voters });

	  io.emit('connections', { clientsCount: io.engine.clientsCount, voters: voters, score: score });
	  socket.on('disconnect', function () {
	    if (officialPositionBroadcaster === socket.id) {
	      // the OPB is dead, long live the OPB
	      chooseNewOfficialPositionBroadcaster();
	      // console.log('new OPB', officialPositionBroadcaster)
	    }

	    candidates.splice(candidates.indexOf(socket.id), 1);

	    thisConnectedIsLeft ? voters.pLeft -= 1 : voters.pRight -= 1;
	    io.emit('connections', { clientsCount: io.engine.clientsCount, voters: voters, score: score });

	    updatePaddleSpeed();
	  });

	  nextConnectedIsLeft = !nextConnectedIsLeft;
	});

	server.listen(_PORT_, function () {
	  console.log('Listening on port ' + _PORT_ + '...');
	});
	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var phantom = __webpack_require__(6);

	var sitepage = null;
	var phInstance = null;
	phantom.create().then(function (instance) {
	  phInstance = instance;
	  return instance.createPage();
	}).then(function (page) {
	  sitepage = page;
	  return sitepage.open('http://localhost:3000');
	}).then(function (status) {
	  console.log(status);
	  // return sitepage.property('content') // return site content
	  return sitepage.evaluate(function () {
	    var t = document.getElementById('intro').innerHTML;
	    return t;
	  });
	}).then(function (doc) {
	  console.log(doc);
	  sitepage.close();
	  phInstance.exit();
	}).catch(function (error) {
	  console.log(error);
	  phInstance.exit();
	});

	// import Canvas from './front/js/pong/canvas'
	// const canvas = new Canvas({'width': 800, 'height': 500, strokeColor: '#fff'})
	// console.log(canvas)

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("phantom");

/***/ }
/******/ ]);