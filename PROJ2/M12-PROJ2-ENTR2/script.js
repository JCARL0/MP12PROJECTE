const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.querySelector(".score_val");
const lifeElement = document.querySelector(".life_val");
const highscoreElement = document.querySelector(".highscore_val");
const levelElement = document.querySelector(".level_val");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let score = 0;
let highscore = 0;
let life = 100;
let gameInterval;
let gameSpeed = 200;  // Valor inicial de la velocidad
let tileCount = 20;
let obstacles = [];
let level = 1;
let foodEaten = 0;

canvas.width = 400;
canvas.height = 400;

function drawGrid() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      ctx.strokeStyle = "#111";
      ctx.strokeRect(x * 20, y * 20, 20, 20);
    }
  }
}

function drawSnake() {
  ctx.fillStyle = "#00ff00";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
  });
}

function drawFood() {
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = obstacle.type === 'tree' ? '#228B22' : obstacle.type === 'bush' ? '#6B8E23' : '#A9A9A9';
    ctx.fillRect(obstacle.x * 20, obstacle.y * 20, 20, 20);
  });
}

function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wrap around the screen (if the snake moves out of bounds, it comes from the other side)
  if (head.x >= tileCount) head.x = 0; // Right to left
  if (head.x < 0) head.x = tileCount - 1; // Left to right
  if (head.y >= tileCount) head.y = 0; // Bottom to top
  if (head.y < 0) head.y = tileCount - 1; // Top to bottom

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    foodEaten++;
    scoreElement.textContent = score;
    placeFood();

    // Aumenta el nivel cada 5 comidas
    if (foodEaten % 5 === 0 && level < 99) {
      level++;
      levelElement.textContent = `Level: ${level}`;
      increaseDifficulty();
    }
  } else {
    snake.pop();
  }

  checkCollisions();
}

function checkCollisions() {
  const head = snake[0];

  // Check if the snake collides with itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }

  // Check if the snake collides with obstacles
  obstacles.forEach(obstacle => {
    if (head.x === obstacle.x && head.y === obstacle.y) {
      if (obstacle.type === 'bush') {
        life -= 5;
      } else if (obstacle.type === 'tree') {
        life -= 10;
      } else if (obstacle.type === 'rock') {
        life -= 20;
      }
      lifeElement.textContent = `${life}%`;
      if (life <= 0) {
        gameOver();
      }
    }
  });
}

function placeFood() {
  let validPosition = false;

  // Ensure the food is not placed on top of the snake or obstacles
  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    validPosition = !obstacles.some(obstacle => obstacle.x === food.x && obstacle.y === food.y);
    validPosition = validPosition && !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function placeObstacles() {
  obstacles = [];
  const numObstacles = level + 2; // Aumenta un obstáculo por nivel

  for (let i = 0; i < numObstacles; i++) {
    let obstacle = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
      type: ['bush', 'tree', 'rock'][Math.floor(Math.random() * 3)],
    };

    obstacles.push(obstacle);
  }
}

function increaseDifficulty() {
  // Aumenta la velocidad un 0.1% por nivel
  gameSpeed = Math.max(50, gameSpeed * 0.999);  // Reduce el intervalo del juego

  // Añade más obstáculos con el aumento de nivel
  placeObstacles();
}

function gameLoop() {
  if (life <= 0) {
    return;
  }

  drawGrid();
  drawFood();
  drawObstacles();
  moveSnake();
  drawSnake();
}

function gameOver() {
  alert("Game Over!");
  highscore = Math.max(score, highscore);
  highscoreElement.textContent = highscore;
  resetGame();
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  foodEaten = 0;
  level = 1;
  life = 100;
  scoreElement.textContent = score;
  lifeElement.textContent = life;
  levelElement.textContent = `Level: ${level}`;
  placeFood();
  placeObstacles();
  clearInterval(gameInterval);
}

startButton.addEventListener("click", () => {
  resetGame();
  gameInterval = setInterval(gameLoop, gameSpeed);
});

pauseButton.addEventListener("click", () => {
  clearInterval(gameInterval);
});

document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});
