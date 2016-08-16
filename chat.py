from flask import Flask, jsonify, render_template, request, make_response, redirect
import objects

app = Flask(__name__)


def badAuth(token):
    return jsonify({'Status':'BAD AUTH'})


@app.route('/r/<chat_id>')
def hello_world(chat_id):
    return render_template('room.html',chat_id = chat_id)


@app.route('/login/<chat_id>', methods=['GET'])
def login_page(chat_id):
    return render_template('sign-in.html',chat_id=chat_id)


@app.route('/login', methods=['POST', 'GET'])
def login():
    username = request.form.get('username')
    room = objects.get_room(request.form.get('chat_id'))
    token = room.new_user(username)
    if token:
        response = make_response(redirect('/r/' + request.form.get('chat_id')))
        response.set_cookie(request.form.get('chat_id'), token)
        return response
    else:
        return render_template('sign-in.html',chat_id = '')


@app.route('/api/<roomName>/<function>', methods=['GET', 'POST'])
def chat(roomName,function):
    room = objects.get_room(roomName)
    token = request.form['_token']

    if function == 'chat':
        chatdata = room.get_chat(request.form['_last_id'],token)
        if chatdata is not False:
            if len(chatdata) > 0:
                chatdata['Status'] = 'OK'
                return jsonify(chatdata)
            return jsonify({'Status':'NO MSGS'})
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'msg':
        if room.message(token,request.form['msg'],request.form['_is_crypto']):
            return jsonify({'Status':'OK'})
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'key':
        keys = room.get_rand_key(token)
        key = keys[0]
        salt = keys[1]
        if key:
            return jsonify({'_rand_key': key,'_salt': salt,'Status': 'OK'})
        else:
            return jsonify({'Status': 'BAD AUTH'})

    if function == 'setCrypto':
        if room.set_crypto(token):
            return jsonify({'Status':'OK'})
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'diceRoll':
        result = room.roll_die(token,request.form['_sides'])
        return jsonify({'diceRoll': str(result)})

    if function == 'isAdmin':
        if room.check_admin(token):
            return jsonify({'admin': 'OK'})
        return jsonify({'admin': 'BAD AUTH'})

    if function == 'inviteUser':
        if room.invite_user(token,request.form['_recipient'],request.form['_msg']):
            return jsonify({'Status':'OK'})
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'getUsers':
        users = room.user_list(token)
        if users:
            return jsonify(users)
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'dh-negotiation':
        negotiation = room.duffie_hellman_negotiate(token)
        if negotiation:
            return jsonify(negotiation)
        else:
            return badAuth(token)

    if function == 'dh-exchange':
        key = room.duffie_hellman_calculate(token,request.form['_public_key'])
        if key:
            return jsonify({'_key':key})
        else:
            return badAuth(token)

    if function == 'kick':
        result = room.admin_exec(token,'kick',request.form['_user'])
        if result:
            return jsonify({'Status':'OK'})
        else:
            return jsonify({'Status':'BAD AUTH'})

    if function == 'promote':
        result = room.admin_exec(token,'promote',request.form['_user'])
        if result:
            return jsonify({'Status':'OK'})
        else:
            return jsonify({'Status':'BAD AUTH'})



if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',use_reloader=False)
