const canvas_p2 = document.getElementById('game-board-player2');
const context_p2 = canvas_p2.getContext('2d');
const socket_p2 = io.connect('http://localhost:5000/snakeVS');

// Snake variables
let player2_state = room_data['player2_state'];
let player2_sid = room_data['player2_sid'];

let data_p2 = {
    snake: player2_state['snake'],
    food: player2_state['food'],
    dx: player2_state['dx'],
    dy: player2_state['dy'],
    score: player2_state['score'],
    gameover: player2_state['gameover'],
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}
const sessionID_c2 = getCookie('sid');

// Keyboard event listener for direction control
document.addEventListener('keydown', (event) => {
    if (sessionID_c2 === player2_sid){
        if (event.key === 'ArrowUp' && data_p2['dy'] === 0) {
            data_p2['dx'] = 0;
            data_p2['dy'] = -1; // Up
        } else if (event.key === 'ArrowDown' && data_p2['dy'] === 0) {
            data_p2['dx'] = 0;
            data_p2['dy'] = 1;  // Down
        } else if (event.key === 'ArrowLeft' && data_p2['dx'] === 0) {
            data_p2['dx'] = -1; // Left
            data_p2['dy'] = 0;
        } else if (event.key === 'ArrowRight' && data_p2['dx'] === 0) {
            data_p2['dx'] = 1;  // Right
            data_p2['dy'] = 0;
        }
    }

});

// Game loop
function draw() {
    context_p2.clearRect(0, 0, canvas_p2.width, canvas_p2.height);
    drawSnake();
    drawFood();
    updateSnake();
    checkCollision();
    setTimeout(draw, speed); // Call the draw function after a delay (controlled by the speed variable)
}

function drawSnake() {
    context_p2.fillStyle = 'green';
    data_p2['snake'].forEach(segment => {
        context_p2.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    context_p2.fillStyle = 'red';
    context_p2.fillRect(data_p2['food'].x * gridSize, data_p2['food'].y * gridSize, gridSize, gridSize);
}

function updateSnake() {
    const head = { x: data_p2['snake'][0].x + data_p2['dx'], y: data_p2['snake'][0].y + data_p2['dy'] };
    data_p2['snake'].unshift(head);
    if (head.x === data_p2['food'].x && head.y === data_p2['food'].y) {
        // Snake ate the food
        data_p2['food'].x = Math.floor(Math.random() * canvas_p2.width / gridSize);
        data_p2['food'].y = Math.floor(Math.random() * canvas_p2.height / gridSize);
        data_p2['score'] += 1;
    } else {
        data_p2['snake'].pop();
    }
    socket_p2.emit('player_update', { room_code: roomCode, data: data_p2 });
}

function checkCollision() {
    // Check for collision with the walls or itself
    const head = data_p2['snake'][0];
    if (head.x < 0 || head.x * gridSize >= canvas_p2.width || head.y < 0 || head.y * gridSize >= canvas_p2.height) {
        data_p2['gameover'] = 1;
        socket_p2.emit('player_update', { room_code: roomCode, data: data_p2 });
    }
    for (let i = 1; i < data_p2['snake'].length; i++) {
        if (head.x === data_p2['snake'][i].x && head.y === data_p2['snake'][i].y) {
            data_p2['gameover'] = 1;
            socket_p2.emit('player_update', { room_code: roomCode, data: data_p2 });
            break;
        }
    }
}

draw();


