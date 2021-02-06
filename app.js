// Balls
const ballData = {
	ballX: 75,
	ballY: 75,
	SpeedX: 5,
	SpeedY: 7
};

// Bricks
const Bricks = {
	BRICK_W: 80,
	BRICK_H: 20,
	BRICK_GAP: 2,
	BRICK_COLS: 10,
	BRICK_ROWS: 14
};
let brickGrid = new Array(Bricks['BRICK_COLS'] * Bricks['BRICK_ROWS']);
let bricksLeft = 0;

// Paddle
let paddle = {
	PADDLE_WIDTH: 100,
	PADDLE_THICKNESS: 10,
	PADDLE_DIST_FROM_EDGE: 60,
	paddleX: 400,
} ;

// Canvas
let canvas, canvasContext;

let mouseX = 0;
let mouseY = 0;

const updateMousePos = (evt) => {
	let rect = canvas.getBoundingClientRect();
	let root = document.documentElement;

	mouseX = evt.clientX - rect.left - root.scrollLeft;
	mouseY = evt.clientY - rect.top - root.scrollTop;

	paddle['paddleX'] = mouseX - paddle['PADDLE_WIDTH']/2;

	// cheat
	// ballData['ballX'] = mouseX;
	// ballData['ballY'] = mouseY;
	// ballData['SpeedX'] = 4;
	// ballData['SpeedY'] = -4;
};

const brickReset = () => {
	bricksLeft = 0;
	let i;
	for(i=0; i< 3*Bricks['BRICK_COLS']; i++) {
		brickGrid[i] = false;
	}
	for(i = 3 * Bricks['BRICK_COLS']; i<Bricks['BRICK_COLS'] * Bricks['BRICK_ROWS']; i++) {
		brickGrid[i] = true;
		bricksLeft++;
	}

};

window.onload = () => {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');

	let framesPerSecond = 60;
	setInterval(updateAll, 1000/framesPerSecond);

	canvas.addEventListener('mousemove', updateMousePos);

	brickReset();
	ballReset();
};

const updateAll = () => {
	moveAll();
	drawAll();
};

const ballReset = () => {
	ballData['ballX'] = canvas.width/2;
	ballData['ballY'] = canvas.height/2;
};

const ballMove = () => {
	ballData['ballX'] += ballData['SpeedX'];
	ballData['ballY'] += ballData['SpeedY'];

	if(ballData['ballX'] < 0 && ballData['SpeedX'] < 0.0) {
		ballData['SpeedX'] *= -1;
	}
	if(ballData['ballX'] > canvas.width  && ballData['SpeedX'] > 0.0) {
		ballData['SpeedX'] *= -1;
	}
	if(ballData['ballY'] < 0  && ballData['SpeedY'] < 0.0) {
		ballData['SpeedY'] *= -1;
	}
	if(ballData['ballY'] > canvas.height) {
		ballReset();
		brickReset();
	}
};

const checkBrickPosition = (col, row) => {
	if(col >= 0 && col < Bricks['BRICK_COLS'] &&
		row >= 0 && row < Bricks['BRICK_ROWS']) {
		 let brickIndexUnderCoord = BrickPositions(col, row);
		 return brickGrid[brickIndexUnderCoord];
	} else {
		return false;
	}
};

const BrickHandling = () => {
	let ballBrickCol = Math.floor(ballData['ballX'] / Bricks['BRICK_W']);
	let ballBrickRow = Math.floor(ballData['ballY'] / Bricks['BRICK_H']);
	let brickIndexUnderBall = BrickPositions(ballBrickCol, ballBrickRow);

	if(ballBrickCol >= 0 && ballBrickCol < Bricks['BRICK_COLS'] &&
		ballBrickRow >= 0 && ballBrickRow < Bricks['BRICK_ROWS']) {

		if(checkBrickPosition( ballBrickCol,ballBrickRow )) {
			brickGrid[brickIndexUnderBall] = false;
			bricksLeft--;

			let prevBallX = ballData['ballX'] - ballData['SpeedX'];
			let prevBallY = ballData['ballY'] - ballData['SpeedY'];
			let prevBrickCol = Math.floor(prevBallX / Bricks['BRICK_W']);
			let prevBrickRow = Math.floor(prevBallY / Bricks['BRICK_H']);

			let bothTestsFailed = true;

			if(prevBrickCol != ballBrickCol) {
				if(checkBrickPosition(prevBrickCol, ballBrickRow) == false) {
					ballData['SpeedX'] *= -1;
					bothTestsFailed = false;
				}
			}
			if(prevBrickRow != ballBrickRow) {
				if(checkBrickPosition(ballBrickCol, prevBrickRow) == false) {
					ballData['SpeedY'] *= -1;
					bothTestsFailed = false;
				}
			}

			if(bothTestsFailed) { // Hit corner of brick
				ballData['SpeedX'] *= -1;
				ballData['SpeedY'] *= -1;
			}

		}
	}

};

const BallHitPaddle = () => {
	let paddleTopEdgeY = canvas.height-paddle['PADDLE_DIST_FROM_EDGE'];
	let paddleBottomEdgeY = paddleTopEdgeY + paddle['PADDLE_THICKNESS'];
	let paddleLeftEdgeX = paddle['paddleX'];
	let paddleRightEdgeX = paddleLeftEdgeX + paddle['PADDLE_WIDTH'];
	if( ballData['ballY'] > paddleTopEdgeY &&
		ballData['ballY'] < paddleBottomEdgeY &&
		ballData['ballX'] > paddleLeftEdgeX &&
		ballData['ballX'] < paddleRightEdgeX) {
		
		ballData['SpeedY'] *= -1;

		let centerOfPaddleX = paddle['paddleX']+paddle['PADDLE_WIDTH']/2;
		let ballDistFromPaddleCenterX = ballData['ballX'] - centerOfPaddleX;
		ballData['SpeedX'] = ballDistFromPaddleCenterX * 0.35;

		if(bricksLeft == 0) {
			brickReset();
		}
	}

};

const moveAll = () => {
	ballMove();
	BrickHandling();

	BallHitPaddle();
};

const BrickPositions = (col, row) => {
	return col + Bricks['BRICK_COLS'] * row;
};

const drawBricks = () => {

	for(let eachRow=0;eachRow<Bricks['BRICK_ROWS'];eachRow++) {
		for(let eachCol=0;eachCol<Bricks['BRICK_COLS'];eachCol++) {

			let arrayIndex = BrickPositions(eachCol, eachRow); 

			if(brickGrid[arrayIndex]) {
				DrawObject(Bricks['BRICK_W']*eachCol,Bricks['BRICK_H']*eachRow,
					Bricks['BRICK_W']-Bricks['BRICK_GAP'],Bricks['BRICK_H']-Bricks['BRICK_GAP'], 'red');
			}
		}
	}

};

// Pointer for deggubing
const colorText = (showWords, textX,textY, fillColor) => {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillText(showWords, textX, textY);
}

const drawAll = () => {
	DrawObject(0,0, canvas.width,canvas.height, 'black'); // clear screen

	DrawCircle(ballData['ballX'],ballData['ballY'], 10, 'white'); // draw ball

	DrawObject(paddle['paddleX'], canvas.height-paddle['PADDLE_DIST_FROM_EDGE'], // draw paddle
				paddle['PADDLE_WIDTH'], paddle['PADDLE_THICKNESS'], 'white');

	drawBricks();
};

const DrawObject = (topLeftX,topLeftY, boxWidth,boxHeight, fillColor) => {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
};

const DrawCircle = (centerX,centerY, radius, fillColor) => {
	canvasContext.fillStyle = fillColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY, 10, 0,Math.PI*2, true);
	canvasContext.fill();
};