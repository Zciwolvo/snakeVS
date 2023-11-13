const socket = io.connect('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Handle game state updates from the server
socket.on('update_game_state', (gameState) => {
    // Update the game board based on the received game state
    // You need to implement this part based on your game logic

    // For simplicity, I'll assume there's a function updateBoard(gameState) that updates the UI
    updateBoard(gameState);
});

// Example: handle keypress events for controlling the snake
document.addEventListener('keydown', (event) => {
    let direction;
    switch (event.key) {
        case 'ArrowUp':
            direction = 'up';
            break;
        case 'ArrowDown':
            direction = 'down';
            break;
        case 'ArrowLeft':
            direction = 'left';
            break;
        case 'ArrowRight':
            direction = 'right';
            break;
    }

    if (direction) {
        // You need to determine the room_code and player_id based on the client
        socket.emit('player_input', { 'room_code': 'your_room_code', 'player_id': 'player1', 'direction': direction });
    }
});

// Example: function to update the game board UI
function updateBoard(gameState) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // Update the board based on the gameState.players and gameState.food
    // You need to implement this part based on your game logic

    const playerState = gameState.your_player_state; // Replace 'your_player_state' with the correct player state key
    for (const segment of playerState.snake) {
        const snakeSegment = document.createElement('div');
        snakeSegment.className = 'snake';
        snakeSegment.style.left = `${segment.x * 40}px`;
        snakeSegment.style.top = `${segment.y * 40}px`;
        gameBoard.appendChild(snakeSegment);
    }

    const foodElement = document.createElement('div');
    foodElement.className = 'food';
    foodElement.style.left = `${gameState.food.x * 40}px`;
    foodElement.style.top = `${gameState.food.y * 40}px`;
    gameBoard.appendChild(foodElement);
}