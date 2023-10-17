from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
from uuid import uuid4

app = Flask(__name__)
socketio = SocketIO(app)

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


@app.route('/create_room')
def create():
    return render_template("create.html")


@app.route('/join_room')
def join():
    return render_template("join.html")


# Function to generate a random room code


def generate_room_code():
    return uuid4()


# Define the initial game state
initial_game_state = {
    'snake': [{'x': 10, 'y': 10}],
    'food': {'x': 15, 'y': 15},
    'score': 0
}

# Route to create a room


@app.route('/create_room')
def create_room():
    room_code = generate_room_code()
    rooms[room_code] = {
        'player1_sid': request.sid,  # Session ID of the host
        'player1_state': initial_game_state,
        'player2_sid': None,
        'player2_state': initial_game_state
    }
    return room_code

# Route to join a room


@app.route('/join_room/<room_code>')
def join_room(room_code):
    if room_code in rooms and rooms[room_code]['player2_sid'] is None:
        # Session ID of the second player
        rooms[room_code]['player2_sid'] = request.sid
        return "Joined room successfully"
    else:
        return "Room is full or does not exist"

# Handle player input for player 1 in a room


@socketio.on('player1_input', namespace='/snakeVS')
def handle_player1_input(data):
    room_code = data['room_code']
    player1_sid = rooms[room_code]['player1_sid']
    # Update player 1's game state based on their input

    # Emit the updated game state to player 1 using player1_sid
    emit('game_state_update',
         rooms[room_code]['player1_state'], namespace='/snakeVS', room=player1_sid)

# Handle player input for player 2 in a room


@socketio.on('player2_input', namespace='/snakeVS')
def handle_player2_input(data):
    room_code = data['room_code']
    player2_sid = rooms[room_code]['player2_sid']
    # Update player 2's game state based on their input

    # Emit the updated game state to player 2 using player2_sid
    emit('game_state_update',
         rooms[room_code]['player2_state'], namespace='/snakeVS', room=player2_sid)


if __name__ == '__main__':
    socketio.run(app, debug=True)
