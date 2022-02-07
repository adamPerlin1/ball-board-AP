//type
const WALL = 'WALL';
const FLOOR = 'FLOOR';
// game element
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';
//images
const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '<img src="img/candy.png" />'

var gBoard;
var gGamerPos;
var gBallInterval;
var gGlueInterval;
var gBallsEaten;
var gBallsOnBoardCount;
var gIsMove;



function initGame() {
	clearInterval(gBallInterval)
	gIsMove = true;
	gBallsEaten = 0;
	document.querySelector('h2 span').innerText = gBallsEaten;
	gBallsOnBoardCount = 2;
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gBallInterval = setInterval(addBall, 2500)
	gGlueInterval = setInterval(addGlue, 5000)
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
				if (i === 5 || j === 5) {
					cell.type = FLOOR;
				}
			}
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (!gIsMove) return
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(gGamerPos.i === 0 || gGamerPos.i === 9) ||
		(gGamerPos.j === 11 || gGamerPos.j === 0)) {

		if (gGamerPos.i === 0) {
			i = gBoard.length - 1
		}
 
		if (targetCell.gameElement === BALL) {
			new Audio('sound/sfx-pop3.mp3').play();
			gBallsEaten++
			gBallsOnBoardCount--
			document.querySelector('h2 span').innerText = gBallsEaten;
			if (isVictory()) gameOver()
		} else if (targetCell.gameElement === GLUE) {
			gIsMove = false;
			setTimeout(function () { gIsMove = true; }, 3000)
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Add support for gameElement GLUE, when user steps on 
// GLUE he cannot move for 3 seconds. GLUE is added to board 
// every 5 seconds and gone after 3 seconds
function addGlue() {
	var emptySpaces = getEmptySpaces();
	if (emptySpaces.length === 0) return;
	var emptySpace = emptySpaces[getRandomIntInc(0, emptySpaces.length - 1)];
	gBoard[emptySpace.i][emptySpace.j].gameElement = GLUE
	renderCell(emptySpace, GLUE_IMG)
	setTimeout(function () {
		if (gBoard[emptySpace.i][emptySpace.j].gameElement !== GAMER) {
			gBoard[emptySpace.i][emptySpace.j].gameElement = '';
			renderCell(emptySpace, null)
		}
	}, 3000)
}

//Every few seconds a new ball is added in a random empty cell
function addBall() {
	var emptySpaces = getEmptySpaces();
	if (emptySpaces.length === 0) return;
	var emptySpace = emptySpaces[getRandomIntInc(0, emptySpaces.length - 1)];
	gBoard[emptySpace.i][emptySpace.j].gameElement = BALL;
	gBallsOnBoardCount++
	renderCell(emptySpace, BALL_IMG)
}

function getEmptySpaces() {
	var emptySpaces = [];
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if (gBoard[i][j].type === WALL) continue;
			if (!gBoard[i][j].gameElement) emptySpaces.push({ i: i, j: j })
		}
	}
	return emptySpaces;
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(5, 11)
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === 11) moveTo(5, 0)
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(9, 5)
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === 9) moveTo(0, 5)
			else moveTo(i + 1, j);
			break;

	}

}

function isVictory() {
	return gBallsOnBoardCount === 0;
}

function gameOver() {
	clearInterval(gBallInterval);
}



// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

