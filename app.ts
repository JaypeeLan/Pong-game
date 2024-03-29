// Canvas
const { body } = document;
const canvas = document.createElement("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");
const width: number = 500;
const height: number = 630;
const screenWidth: number = window.screen.width;
const canvasPosition: number = screenWidth / 2 - width / 2;
const isMobile: any = window.matchMedia("(max-width: 600px)");
const gameOverEl = document.createElement("div") as HTMLElement;

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX: number = 225;
let paddleTopX: number = 225;
let playerMoved: boolean = false;
let paddleContact: boolean = false;

// Ball
let ballX: number = 250;
let ballY: number = 315;
const ballRadius = 5;

// Speed
let speedY: number;
let speedX: number;
let trajectoryX: number;
let computerSpeed: number;

// Score
let playerScore: number = 0;
let computerScore: number = 0;
const winningScore: number = 7;
let isGameOver: boolean = true;
let isNewGame: boolean = true;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Render Everything on Canvas
function renderCanvas() {
  if (context !== null) {
    // Canvas Background
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // Paddle Color
    context.fillStyle = "white";

    // Player Paddle (Bottom)
    context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

    // Computer Paddle (Top)
    context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

    // Dashed Center Line
    context.beginPath();
    context.setLineDash([4]);
    context.moveTo(0, 315);
    context.lineTo(500, 315);
    context.strokeStyle = "grey";
    context.stroke();

    // Ball
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 2 * Math.PI, +false);
    context.fillStyle = "white";
    context.fill();
    // Score
    context.font = "32px Courier New";
    context.fillText(`${playerScore}`, 20, canvas.height / 2 + 50);
    context.fillText(`${computerScore}`, 20, canvas.height / 2 - 30);
  }
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// ============= BALL ============= //
// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = "none";
  });
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = playerScore === winningScore ? "Player 1" : "Computer";
    showGameOverEl(winner);
  }
}

function showGameOverEl(winner: string) {
  // Hide Canvas
  canvas.hidden = true;
  // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");
  // Title
  const title = document.createElement("h1");
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", "startGame()");
  playAgainBtn.textContent = "Play Again";
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
}

// Called Every Frame
function animate() {
  renderCanvas();
  // control speed of the ball in relative to position
  ballMove();
  // increament score if it passes a paddle and track direction if it hits a left or roght border
  ballBoundaries();
  // reduces the speed of the computer paddle against the speed of the ball
  computerAI();
  gameOver();

  //  stop animation when the game stops
  !isGameOver ? window.requestAnimationFrame(animate) : null;
}

// On Load
startGame();
