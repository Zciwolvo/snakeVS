from flask import Blueprint, render_template, request
from flask_socketio import SocketIO, emit

game_blueprint = Blueprint('game_blueprint', __name__)
socketio = SocketIO()


@game_blueprint.route("/snake")
def game():
    return render_template("snake.html")


player1_state = {
    'snake': [{'x': 10, 'y': 10}],
    'food': {'x': 15, 'y': 15},
    'score': 0
}

player2_state = {
    'snake': [{'x': 20, 'y': 20}],
    'food': {'x': 25, 'y': 25},
    'score': 0
}


@game_blueprint.route("/snakeVS")
def game():
    return render_template("snakeVS.html")


@socketio.on('player1_input', namespace='/snakeVS')
def handle_player1_input(data):
    client_sid = request.sid
    emit('game_state_update', player1_state,
         namespace='/snakeVS', room=client_sid)


@socketio.on('player2_input', namespace='/snakeVS')
def handle_player2_input(data):
    client_sid = request.sid
    emit('game_state_update', player2_state,
         namespace='/snakeVS', room=client_sid)
