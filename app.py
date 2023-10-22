from flask import Flask, request, render_template, url_for, redirect, jsonify, make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from uuid import uuid4
import string
import random


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


# Handle player input for Player 1


@socketio.on('player_update', namespace='/snakeVS')
def handle_player_update(data):
    room_code = data['room_code']
    player_data = data['data']
    # Include 'sid' in the data received from the client
    player_sid = data['sid']

    if room_code:
        if player_sid == rooms[room_code]['player1_state']['sid']:
            rooms[room_code]['player1_state'] = player_data
            emit('game_state_update_p1', rooms[room_code]['player1_state'],
                 namespace=fr'/snakeVS', room=room_code)
        elif player_sid == rooms[room_code]['player2_state']['sid']:
            rooms[room_code]['player2_state'] = player_data
            emit('game_state_update_p2', rooms[room_code]['player2_state'],
                 namespace=fr'/snakeVS', room=room_code)
        else:
            return jsonify({'message': "Incorrect session ID from one of the players"})


if __name__ == '__main__':
    socketio.run(app, debug=True)
