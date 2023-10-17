const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');

// Snake variables
let snake;
const gridSize = 20;
const food = { x: 15, y: 15 };
let score = 0;
let dx = 1; // Initial direction: right
let dy = 0;

// Speed control
const speed = 100; // Adjust this value to control the speed (milliseconds per frame)

// Initialize the Snake
function initializeSnake() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
}

initializeSnake(); // Call this function to set up the Snake initially.

// Keyboard event listener for direction control
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -1; // Up
    } else if (event.key === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = 1;  // Down
    } else if (event.key === 'ArrowLeft' && dx === 0) {
        dx = -1; // Left
        dy = 0;
    } else if (event.key === 'ArrowRight' && dx === 0) {
        dx = 1;  // Right
        dy = 0;
    }
});

// Game loop
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    updateSnake();
    checkCollision();
    setTimeout(draw, speed); // Call the draw function after a delay (controlled by the speed variable)
}

function drawSnake() {
    context.fillStyle = 'green';
    snake.forEach(segment => {
        context.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    context.fillStyle = 'red';
    context.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function updateSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        // Snake ate the food
        food.x = Math.floor(Math.random() * canvas.width / gridSize);
        food.y = Math.floor(Math.random() * canvas.height / gridSize);
        score += 1;
        document.getElementById('score').textContent = `Score: ${score}`;
    } else {
        snake.pop();
    }
}

function checkCollision() {
    // Check for collision with the walls or itself
    const head = snake[0];
    if (head.x < 0 || head.x * gridSize >= canvas.width || head.y < 0 || head.y * gridSize >= canvas.height) {
        alert('Game over!');
        initializeSnake(); // Reset the Snake
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            alert('Game over!');
            initializeSnake(); // Reset the Snake
            break;
        }
    }
}

draw(); // Start the game loop


