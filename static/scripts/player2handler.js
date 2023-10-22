const canvas_p2 = document.getElementById('game-board-player2');
const context_p2 = canvas_p2.getContext('2d');

socket.on('game_state_update_p2', (updatedGameState) => {
    player2_state = updatedGameState;
});

// Snake variables
let player2_state = Object.assign({}, room_data['player2_state']);
let player2_sid = room_data['player2_state']['sid'];


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
        if (event.key === 'ArrowUp' && player2_state['dy'] === 0) {
            player2_state['dx'] = 0;
            player2_state['dy'] = -1; // Up
        } else if (event.key === 'ArrowDown' && player2_state['dy'] === 0) {
            player2_state['dx'] = 0;
            player2_state['dy'] = 1;  // Down
        } else if (event.key === 'ArrowLeft' && player2_state['dx'] === 0) {
            player2_state['dx'] = -1; // Left
            player2_state['dy'] = 0;
        } else if (event.key === 'ArrowRight' && player2_state['dx'] === 0) {
            player2_state['dx'] = 1;  // Right
            player2_state['dy'] = 0;
        }
    }
    socket.emit('player_update', { room_code: roomCode, data: player2_state, sid: sessionID_c2 });

});

// Game loop
function draw() {
    context_p2.clearRect(0, 0, canvas_p2.width, canvas_p2.height);
    drawSnake();
    drawFood();
    updateSnake();
    checkCollision();
    console.log("p1",player1_state);
    console.log("p2",player2_state);
    socket.emit('player_update', { room_code: roomCode, data: player2_state, sid: sessionID_c2 });
    setTimeout(draw, speed); // Call the draw function after a delay (controlled by the speed variable)
}

function drawSnake() {
    context_p2.fillStyle = 'green';
    player2_state['snake'].forEach(segment => {
        context_p2.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    context_p2.fillStyle = 'red';
    context_p2.fillRect(player2_state['food'].x * gridSize, player2_state['food'].y * gridSize, gridSize, gridSize);
}

function updateSnake() {
    const head = { x: player2_state['snake'][0].x + player2_state['dx'], y: player2_state['snake'][0].y + player2_state['dy'] };
    player2_state['snake'].unshift(head);
    if (head.x === player2_state['food'].x && head.y === player2_state['food'].y) {
        // Snake ate the food
        player2_state['food'].x = Math.floor(Math.random() * canvas_p2.width / gridSize);
        player2_state['food'].y = Math.floor(Math.random() * canvas_p2.height / gridSize);
        player2_state['score'] += 1;
        document.getElementById('score-player2').textContent = `Player 2 Score: ${player2_state['score']}`;
    } else {
        player2_state['snake'].pop();
    }
}

function checkCollision() {
    // Check for collision with the walls or itself
    const head = player2_state['snake'][0];
    if (head.x < 0 || head.x * gridSize >= canvas_p2.width || head.y < 0 || head.y * gridSize >= canvas_p2.height) {
        player2_state['gameover'] = 1;
    }
    for (let i = 1; i < player2_state['snake'].length; i++) {
        if (head.x === player2_state['snake'][i].x && head.y === player2_state['snake'][i].y) {
            player2_state['gameover'] = 1;
            break;
        }
    }
}

draw();


