const canvas_p1 = document.getElementById('game-board-player1');
const context_p1 = canvas_p1.getContext('2d');
const socket_p1 = io.connect('http://localhost:5000/snakeVS');

// Snake variables
let player1_state = room_data['player1_state'];
let player1_sid = room_data['player1_sid'];

const gridSize = 20;

let data_p1 = {
    snake: player1_state['snake'],
    food: player1_state['food'],
    dx: player1_state['dx'],
    dy: player1_state['dy'],
    score: player1_state['score'],
    gameover: player1_state['gameover'],
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}
const sessionID_c1 = getCookie('sid');

// Speed control
const speed = 100; // Adjust this value to control the speed (milliseconds per frame)

// Keyboard event listener for direction control
document.addEventListener('keydown', (event) => {
    if (sessionID_c1 === player1_sid){
        if (event.key === 'ArrowUp' && data_p1['dy'] === 0) {
            data_p1['dx'] = 0;
            data_p1['dy'] = -1; // Up
        } else if (event.key === 'ArrowDown' && data_p1['dy'] === 0) {
            data_p1['dx'] = 0;
            data_p1['dy'] = 1;  // Down
        } else if (event.key === 'ArrowLeft' && data_p1['dx'] === 0) {
            data_p1['dx'] = -1; // Left
            data_p1['dy'] = 0;
        } else if (event.key === 'ArrowRight' && data_p1['dx'] === 0) {
            data_p1['dx'] = 1;  // Right
            data_p1['dy'] = 0;
        }
    }

});

// Game loop
function draw() {
    context_p1.clearRect(0, 0, canvas_p1.width, canvas_p1.height);
    drawSnake();
    drawFood();
    updateSnake();
    checkCollision();
    setTimeout(draw, speed); // Call the draw function after a delay (controlled by the speed variable)
}

function drawSnake() {
    context_p1.fillStyle = 'green';
    data_p1['snake'].forEach(segment => {
        context_p1.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    context_p1.fillStyle = 'red';
    context_p1.fillRect(data_p1['food'].x * gridSize, data_p1['food'].y * gridSize, gridSize, gridSize);
}

function updateSnake() {
    const head = { x: data_p1['snake'][0].x + data_p1['dx'], y: data_p1['snake'][0].y + data_p1['dy'] };
    data_p1['snake'].unshift(head);
    if (head.x === data_p1['food'].x && head.y === data_p1['food'].y) {
        // Snake ate the food
        data_p1['food'].x = Math.floor(Math.random() * canvas_p1.width / gridSize);
        data_p1['food'].y = Math.floor(Math.random() * canvas_p1.height / gridSize);
        data_p1['score'] += 1;
    } else {
        data_p1['snake'].pop();
    }
    socket_p1.emit('player_update', { room_code: roomCode, data: data_p1 });
}

function checkCollision() {
    // Check for collision with the walls or itself
    const head = data_p1['snake'][0];
    if (head.x < 0 || head.x * gridSize >= canvas_p1.width || head.y < 0 || head.y * gridSize >= canvas_p1.height) {
        data_p1['gameover'] = 1;
        socket_p1.emit('player_update', { room_code: roomCode, data: data_p1 });
    }
    for (let i = 1; i < data_p1['snake'].length; i++) {
        if (head.x === data_p1['snake'][i].x && head.y === data_p1['snake'][i].y) {
            data_p1['gameover'] = 1;
            socket_p1.emit('player_update', { room_code: roomCode, data: data_p1 });
            break;
        }
    }
}

draw();


