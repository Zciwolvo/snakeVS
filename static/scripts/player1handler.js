const canvas_p1 = document.getElementById('game-board-player1');
const context_p1 = canvas_p1.getContext('2d');

const socket = io.connect(`http://localhost:5000/snakeVS`);

socket.on('game_state_update_p1', (updatedGameState) => {
    player1_state = updatedGameState;
});

// Snake variables
let player1_state = Object.assign({}, room_data['player1_state']);
let player1_sid = room_data['player1_state']['sid'];

let gridSize = 20;
let speed = 500;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}
const sessionID_c1 = getCookie('sid');

// Keyboard event listener for direction control
document.addEventListener('keydown', (event) => {
    if (sessionID_c1 === player1_sid){
        if (event.key === 'ArrowUp' && player1_state['dy'] === 0) {
            player1_state['dx'] = 0;
            player1_state['dy'] = -1; // Up
        } else if (event.key === 'ArrowDown' && player1_state['dy'] === 0) {
            player1_state['dx'] = 0;
            player1_state['dy'] = 1;  // Down
        } else if (event.key === 'ArrowLeft' && player1_state['dx'] === 0) {
            player1_state['dx'] = -1; // Left
            player1_state['dy'] = 0;
        } else if (event.key === 'ArrowRight' && player1_state['dx'] === 0) {
            player1_state['dx'] = 1;  // Right
            player1_state['dy'] = 0;
        }
    }
    socket.emit('player_update', { room_code: roomCode, data: player1_state, sid: sessionID_c1 });

});

// Game loop
function draw() {
    context_p1.clearRect(0, 0, canvas_p1.width, canvas_p1.height);
    drawSnake();
    drawFood();
    updateSnake();
    checkCollision();
    socket.emit('player_update', { room_code: roomCode, data: player1_state, sid: sessionID_c1 });
    setTimeout(draw, speed); // Call the draw function after a delay (controlled by the speed variable)
}

function drawSnake() {
    context_p1.fillStyle = 'green';
    player1_state['snake'].forEach(segment => {
        context_p1.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    context_p1.fillStyle = 'red';
    context_p1.fillRect(player1_state['food'].x * gridSize, player1_state['food'].y * gridSize, gridSize, gridSize);
}

function updateSnake() {
    const head = { x: player1_state['snake'][0].x + player1_state['dx'], y: player1_state['snake'][0].y + player1_state['dy'] };
    player1_state['snake'].unshift(head);
    if (head.x === player1_state['food'].x && head.y === player1_state['food'].y) {
        // Snake ate the food
        player1_state['food'].x = Math.floor(Math.random() * canvas_p1.width / gridSize);
        player1_state['food'].y = Math.floor(Math.random() * canvas_p1.height / gridSize);
        player1_state['score'] += 1;
        document.getElementById('score-player1').textContent = `Player 1 Score: ${player1_state['score']}`;
    } else {
        player1_state['snake'].pop();
    }
}

function checkCollision() {
    // Check for collision with the walls or itself
    const head = player1_state['snake'][0];
    if (head.x < 0 || head.x * gridSize >= canvas_p1.width || head.y < 0 || head.y * gridSize >= canvas_p1.height) {
        player1_state['gameover'] = 1;
    }
    for (let i = 1; i < player1_state['snake'].length; i++) {
        if (head.x === player1_state['snake'][i].x && head.y === player1_state['snake'][i].y) {
            player1_state['gameover'] = 1;
            break;
        }
    }
}

draw();


