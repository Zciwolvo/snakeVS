// WebSocket setup (make sure this is set up properly in your code)
const socket = io.connect('http://' + document.domain + ':' + location.port);

// Handle the game state update from the server
socket.on('game_state_update', function(data) {
    snake = data.snake;
    food = data.food;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
});