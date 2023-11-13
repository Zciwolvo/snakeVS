from flask import Flask, request, render_template, url_for, redirect, jsonify, make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from uuid import uuid4
import string
import random
import eventlet


app = Flask(__name__)
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

# Dictionary to manage rooms and game states
rooms = {}


@app.route('/')
def home():
    return render_template("home.html")


@app.route('/snakeVS')
def snakeVS():
    return render_template("snakeVS.html")


@app.route('/snake')
def snake():
    return render_template("snake.html")


@app.route('/join_room')
def join():
    return render_template("join.html")


# Function to generate a random room code


def generate_room_code():
    res = ''.join(random.choices(string.ascii_uppercase +
                                 string.digits, k=6))
    return res


def generate_sid():
    return str(uuid4())


# Define the initial game state
initial_game_state = {
    'sid': None,
    'ready': 0,
    'snake': [{'x': 10, 'y': 10}],
    'food': {'x': 15, 'y': 15},
    'dx': 1,
    'dy': 0,
    'score': 0,
    'gameover': 0
}

# Route to create a room


@app.route('/create_room')
def create_room():
    room_code = generate_room_code()
    player1_sid = generate_sid()

    response = make_response(render_template(
        "create.html", room_code=room_code))  # Render 'create.html'
    response.set_cookie('sid', player1_sid, path="/")  # Set the 'sid' cookie

    rooms[room_code] = {
        'player1_state': initial_game_state.copy(),
        'player2_state': initial_game_state.copy()
    }

    rooms[room_code]['player1_state']['sid'] = player1_sid
    # Set 'player2_state' to None
    rooms[room_code]['player2_state']['sid'] = None

    return response  # Return the response with the cookie set


# Route to join a room


@app.route('/join_room/<room_code>')
def join_room(room_code):

    if room_code in rooms and rooms[room_code]['player2_state']['sid'] is None:
        player2_sid = generate_sid()
        response = make_response(render_template(
            "join.html"))  # Render 'join.html'
        # Set the 'sid' cookie
        response.set_cookie('sid', player2_sid, path="/")

        rooms[room_code]['player2_state']['sid'] = player2_sid
        print(rooms[room_code]['player2_state']['sid'])

        if rooms[room_code]['player1_state']['sid'] is not None and rooms[room_code]['player2_state']['sid'] is not None:
            # Both players are present, move to the 'lobby' page
            response = make_response(render_template(
                "lobby.html", room_code=room_code))  # Render 'join.html'
            # Set the 'sid' cookie
            print(
                rooms[room_code]['player2_state']['sid'])
            response.set_cookie('sid', player2_sid, path="/")
            return response
        else:
            return response  # Return the response with the cookie set

    else:
        return render_template("join.html")


@app.route('/lobby/<room_code>')
def lobby(room_code):
    print(rooms[room_code])
    return render_template("lobby.html", room_code=room_code)


@app.route('/set_ready_status/<room_code>', methods=['POST'])
def set_ready_status(room_code):
    data = request.get_json()
    sid = data.get('sid')

    if room_code in rooms:
        if rooms[room_code]['player1_state']['sid'] == sid:
            rooms[room_code]['player1_state']['ready'] = 1
            return jsonify({'message': 'Player 1 is ready'})
        elif rooms[room_code]['player2_state']['sid'] == sid:
            rooms[room_code]['player2_state']['ready'] = 1
            return jsonify({'message': 'Player 2 is ready'})

    return jsonify({'message': 'Player not found or room does not exist'})


@app.route('/players_ready/<room_code>')
def set_player_ready(room_code):
    if room_code in rooms:
        if rooms[room_code]['player1_state']['ready'] == 1 and rooms[room_code]['player2_state']['ready'] == 1:
            return jsonify({'status': 'ready'})

        return jsonify({'status': 'waiting'})
    return jsonify({'message': 'Room doesnt exist'})


@app.route('/check_room_status/<room_code>')
def check_room_status(room_code):
    if room_code in rooms:
        if rooms[room_code]['player1_state']['sid'] is not None and rooms[room_code]['player2_state']['sid'] is not None:
            # Both players have joined
            return jsonify({'status': 'ready'})

    # Room is not ready yet
    return jsonify({'status': 'waiting'})

# Route for snakeVS


@app.route('/snakeVS/<room_code>')
def snake_vs(room_code):
    if room_code in rooms:
        return render_template("snakeVS.html", room_code=room_code, room_data=rooms[room_code])
    else:
        return "Room does not exist"

# Update game state and emit it to all connected clients in a specific room


def update_game_state(room_code):
    socketio.emit('update_game_state', rooms[room_code], room=room_code)

# Handle player input from the client in a specific room


@socketio.on('player_input')
def handle_player_input(data):
    room_code = data['room_code']
    player_id = data['player_id']
    direction = data['direction']
    move_snake(room_code, player_id, direction)

# Move the snake based on the direction in a specific room


def move_snake(room_code, player_id, direction):
    player_state = rooms[room_code][f'{player_id}_state']
    head = player_state['snake'][0].copy()

    if direction == 'up':
        player_state['dy'] = -1
        player_state['dx'] = 0
    elif direction == 'down':
        player_state['dy'] = 1
        player_state['dx'] = 0
    elif direction == 'left':
        player_state['dx'] = -1
        player_state['dy'] = 0
    elif direction == 'right':
        player_state['dx'] = 1
        player_state['dy'] = 0

    # Update the snake's position
    head['x'] += player_state['dx']
    head['y'] += player_state['dy']

    # Check for collisions with the food
    if head == player_state['food']:
        # Move the food to a new random position
        player_state['food'] = {'x': random.randint(
            1, 9), 'y': random.randint(1, 9)}
        player_state['snake'].insert(0, head)
        player_state['score'] += 1
    else:
        # Remove the last segment of the snake
        player_state['snake'].pop()
        player_state['snake'].insert(0, head)

    # Check for collisions with the walls or itself
    if (
        head['x'] < 0 or head['x'] >= 10 or
        head['y'] < 0 or head['y'] >= 10 or
        head in player_state['snake'][1:]
    ):
        # Set gameover state and reset the game for the specific player
        player_state['gameover'] = 1
        reset_game(room_code, player_id)

    update_game_state(room_code)

# Reset the game state for a specific player in a specific room


def reset_game(room_code, player_id):
    player_state = rooms[room_code][f'{player_id}_state']
    player_state.update(initial_game_state)
    update_game_state(room_code)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    eventlet.monkey_patch()
    socketio.run(app, debug=True)
