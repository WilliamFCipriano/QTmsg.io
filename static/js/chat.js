/** QTMSG.io **/
/** Written by Will Cipriano **/

// To be compressed and compiled before use

/** debug modes **/

var crypto_debug = false;
var admin_debug = false;
var feature_debug = false;

/** global variables **/

var CryptoEnabled = true;
var ChatCryptoKey = '';
var RoomSalt = '';
var PrivateCryptoKey = '';
var Cookies = {};
var imAdmin = false;
var duffieKey = false;
var userStore = [];
var userViewed = [];
var soundsEnabled = true;
var presenceUpdated = false;


function getCookie(name) {
    if (!(name in Cookies)) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) var cookie = parts.pop().split(";").shift();
        Cookies[name] = cookie.split('"').join('');
        return Cookies[name]
    }
    else
        return Cookies[name]
}

// Translates server key into 64 character client key
// Currently this key is never generated server side so it can be considered very weakly zero knowledge.
function translateKey(key, salt) {

    var newKey = sjcl.hash.sha256.hash(key);
    var iterations = 0;

    // hashStack is an attempt to increase memory usage/computational time for potential attackers slightly and
    // create a bit more obscurity.
    var hashStack = '';

    // minimum 2,5k rounds recommended (generates 640kb of data at 2.5k)
    // so they will be forced to store hashStack in slower memory.
    // only effective in slowing attackers down if the Diffie Hellman is broken in such a way that a large number of potential keys have
    // to be attempted, Again, not security but another layer of obfuscation.

    while (iterations < 2500) {
        if (iterations % 2 == 0) {
            newKey = sjcl.hash.sha256.hash(newKey + key);
        }
        else {
            newKey = sjcl.hash.sha256.hash(key + newKey);
        }
        hashStack += sjcl.codec.hex.fromBits(newKey);
        iterations += 1;
    }


    // begin salting/hashStack phase
    iterations = 0;
    var stackRounds = Math.floor(hashStack.length / 5);

    while (iterations < stackRounds) {

        newKey = sjcl.hash.sha256.hash(salt + newKey + hashStack.substr(0,5));
        hashStack = hashStack.substr(5);
        iterations += 1;

    }

    // this will break all sessions on the new year (GMT) by design.
    // QTMSG is not for very long sessions and you should be having fun on new years.
    iterations = 0;
    var date = new Date();
    while (iterations < date.getUTCFullYear() * 8) {
        newKey = sjcl.hash.sha256.hash(newKey);
        iterations += 1;
    }


    newKey = sjcl.codec.hex.fromBits(newKey);

    if (crypto_debug == true) {
        console.log('Chat key translated: ' + newKey)
    }

    return newKey;

}

// When crypto fails, the chat is probably using a private key.
// Prompt the user for it in that case.

function privateKey() {
    if (imAdmin == true) {

    var passwd = prompt('Please enter the private password you want to use for this chat.');
    var session = {'_token': getCookie(chat_id)};
    if (passwd != null) {
        document.getElementById("msg-data").readOnly = false;
    $.post('/api/' + chat_id + '/setCrypto', session, function (status) {
        if(status['Status'] == 'OK') {
        $("#encryption-button").html('&#x1F512;');
        PrivateCryptoKey = translateKey(passwd, RoomSalt);
        chat_update(true);
        document.getElementById("msg-data").readOnly = true}
        if(status['Status'] == 'BAD AUTH') {
            $("#error-area").text('Admin access denied!');
        }
    }, 'json'); } }
    else {
        alert('You are not an administrator for this chat thus, you are not allowed to set a password for it.');
    }

}

// Dice roll for DnD, returns the number rolled when provided with the number of sides

function dice(){
    var type = $('#dice-size-select');
    diceRoll(type.val());
    uiToggle('dice')

}

function diceRoll(sides){
    var rolldata = {'_token': getCookie(chat_id), '_sides': sides};
    $.post('/api/' + chat_id + '/diceRoll', rolldata, function () {
        chat_update(true);
    }, 'json');
}

// before a message is sent it is encrypted using the public or private key
function send_msg(message) {
    var is_crypto;

    if (message == '\n') {
    return; }


    if (CryptoEnabled) {
        if (PrivateCryptoKey == '') {
            message = sjcl.encrypt(ChatCryptoKey, message);
        }
        else {
            $("#encryption-button").html('&#x1F512;');
            message = sjcl.encrypt(PrivateCryptoKey, message)
        }
        is_crypto = true;
    }
    else {
        is_crypto = false;
    }

    var msg = {
        'msg': message, '_token': getCookie(chat_id),
        '_is_crypto': is_crypto
    };

    $.post('/api/' + chat_id + '/msg', msg, function (send_msg) {
        if (send_msg['Status'] != 'OK') {
            $("#error-area").text('Error: Message not sent!');
        }
    }, 'json');
    chat_update(true);
}

// unlocks admin functions on UI, admin access is still checked for on server side.

function checkAdmin() {
    var session = {'_token': getCookie(chat_id)};
    $.post('/api/' + chat_id + '/isAdmin', session, function (result) {
        if (result['admin'] == 'OK') {
            if (admin_debug == true) {
        console.log('User is admin, showing UI');
    }
            $('#admin-button').show();
            $('#encryption-button').show();
            imAdmin = true;
            }
        else {

            if (admin_debug == true) {
        console.log('User is not admin, hiding UI');
    }
            $('#admin-button').hide();
            $('#encryption-button').hide();
            imAdmin = false;
        }
}, 'json');
}

// populate user list with names

function getUsers() {
    var session = {'_token': getCookie(chat_id)};
    var listObject = $("#user-list");
    $.post('/api/' + chat_id + '/getUsers', session, function (users) {
        var i = '';
        for (var user in users) {
            if (userStore.indexOf(user[users]) >= -1) {

                userStore.push(users[user]);
            }

            i += '<li>' + sanitize(users[user]) + '</li>';
        }
        listObject.empty();
        listObject.append(i);
        setUsers();
    }, 'json');



}

// first stage of DH, the DH key is calucated here.
function diffieHellman() {
    var session = {'_token': getCookie(chat_id)};
     $.post('/api/' + chat_id + '/dh-negotiation', session, function (Keydata) {
         var result = getDiffie(bigInt(Keydata['public_n']),bigInt(Keydata['public_g']),bigInt(Keydata['server_key']));
         
         if (result == false) {
             if (crypto_debug) {
                 console.log('diffie-hellman failed, reloading chat.'); }
         location.reload(true);
         return false;
         }

         if (crypto_debug == true) {
             console.log('Attempting DH negotiation phase with public n:' + Keydata['public_n'] + ' public g:' + Keydata['public_g'] + ' and server key:' + Keydata['server_key']); }

         duffieKey = result[1];

         if (crypto_debug == true) {
         console.log('DH key:' + duffieKey);}

         diffieHellmanExchange(result[0])
     }, 'json');

}

// second stage of DH, the DH key is sent to the server and decoded here
function diffieHellmanExchange(public_key) {
    if (crypto_debug == true) {
            console.log('Attempting DH key exchange with server...'); }

    var session = {'_token': getCookie(chat_id),'_public_key': public_key};
    $.post('/api/' + chat_id + '/dh-exchange', session, function (Keydata) {
        var chatKeyData = (decodeKey(duffieKey,Keydata['_key']));
        chatKeyData = chatKeyData.split(':');

            if (crypto_debug == true) {
            console.log('Server generated crypto key:' + chatKeyData[0] + ' Server generated salt:' + chatKeyData[1]); }

        RoomSalt = chatKeyData[1];
        ChatCryptoKey = translateKey(chatKeyData[0], chatKeyData[1]);
        chat_update(false);
     }, 'json');

}

// chat_update is a little too complicated, will improve in later versions.
function chat_update(single) {
        var chatBoardObject = $('#chat-board');
        var chat_length = chatBoardObject.contents().find('#chat-session li').length;
        var session = {'_last_id': chat_length, '_token': getCookie(chat_id)};

    $.post('/api/' + chat_id + '/chat', session, function (chat_data, status) {
        imHere();
        chat_length = chatBoardObject.contents().find('#chat-session li').length;
        var data = chat_data;
        if (chat_data['Status'] == 'OK') {
            var user_update = false;
            var update_interval = 1000;
            if (document.getElementById("msg-data").readOnly == true) {
                $("#error-area").text('');
                document.getElementById("msg-data").readOnly = false;
            }
            var messages = [];
            for (var id in data) {
                if (id != 'Status') {

                    if (id > chat_length) {

                        if (data[id].split('*', 1)[0] == 'roomUpdate') {
                            user_update = true;
                            messages.push('<li><div class="system-message"><b>' + sanitize(data[id].substr(data[id].indexOf("*") + 1), true) + '</b>')

                        }

                        if (data[id].split('*', 1)[0] == 'newUserInvite') {
                            messages.push('<li><div class="system-message"><i>' + sanitize(data[id].substr(data[id].indexOf("*") + 1), true) + '</i>')
                        }

                        if (data[id].split('*', 1)[0] == 'diceRoll') {
                            messages.push('<li><div class="chat-message"> ' + sanitize(data[id].substr(data[id].indexOf("*") + 1), true) + '</div></li>');
                            // play roll sound
                            playSound('roll');

                        }

                        if (data[id].split('*', 1)[0] == 'cryptUpdate') {
                            if (PrivateCryptoKey == '') {
                                var passwd = prompt("This chat requires a password. Please enter it below.");
                                PrivateCryptoKey = translateKey(passwd, RoomSalt);
                                $("#encryption-button").html('&#x1F512;');
                            }

                            messages.push('<li><div class="chat-message">' + ' ' + parse(sanitize(data[id].substr(data[id].indexOf("*") + 1), true)) + '</div></li>');
                        }
                        if (data[id].split('*', 1)[0] == 'crypt') {

                            var user = data[id].split(': ', 1)[0];
                            user = user.substr(user.indexOf("*") + 1);

                            try {
                                var message = sjcl.decrypt(ChatCryptoKey, data[id].substr(data[id].indexOf(": ") + 1));
                            }
                            catch (err) {

                                if (PrivateCryptoKey != '') {
                                    try {
                                        message = sjcl.decrypt(PrivateCryptoKey, data[id].substr(data[id].indexOf(": ") + 1));

                                    }
                                    catch (err) {
                                        $("#error-area").text('Error: Invalid crypto key, please refresh the page and try again.');
                                        $("#encryption-button").html('&#x1F512;');
                                        document.getElementById("msg-data").readOnly = true;
                                        single = true
                                    }
                                }
                                else {
                                    var passwd = prompt("This chat requires a password. Please enter the password.");
                                    PrivateCryptoKey = translateKey(passwd, RoomSalt);
                                    try {
                                        message = sjcl.decrypt(PrivateCryptoKey, data[id].substr(data[id].indexOf(": ") + 1));
                                        $("#encryption-button").html('&#x1F512;');
                                    }
                                    catch (err) {
                                        var passwd = prompt("Incorrect password detected, please try again.");
                                        PrivateCryptoKey = translateKey(passwd, RoomSalt);
                                        try {
                                            message = sjcl.decrypt(PrivateCryptoKey, data[id].substr(data[id].indexOf(": ") + 1));
                                        }
                                        catch (err) {
                                            $("#error-area").text('Decryption error, incorrect password.');
                                        }
                                    }

                                }
                                $("#encryption-button").html('&#x1F512;');
                            }

                            messages.push('<li><div class="chat-message">' + sanitize(user, false) + ': ' + parse(sanitize(message, true)) + '</div></li>');
                        }


                        if (data[id].split('*', 1)[0] == 'msg') {


                            messages.push('<li><div class="chat-message">' + ' ' + parse(sanitize(data[id].substr(data[id].indexOf("*") + 1), true)) + '</div></li>');

                        }
                    }

                } }

            chatBoardObject.contents().find('#chat-session').append(messages.join(""));

            if (user_update) {
                getUsers();
                checkAdmin();
            }

            window.setTimeout(function () {
                var chat_box = chatBoardObject.contents().find('#chat-box');
                chat_box.animate({scrollTop: chat_box.prop("scrollHeight")}, 300)
            }, 0);
            update_interval = Math.floor(Math.random() * 1900) + 900;
            $("#msg-data").prop('disabled', false);
        }

        else if (chat_data['Status'] == 'BAD AUTH') {
            $("#error-area").text('Authentication error, you do not have permission to view this chat!');
            document.getElementById("msg-data").readOnly = true;
            update_interval = 'None'
        }

        else if (chat_data['Status'] == 'NO MSGS') {
            update_interval = Math.floor(Math.random() * 3000) + 1000;
        }
        else if (status != 'success') {
            var errorArea = $("#error-area");
            errorArea.text('Connection error, retrying...');
            document.getElementById("msg-data").readOnly = true;
            update_interval = Math.floor(Math.random() * 20000) + 10000;
            errorArea.text(' ')
        }

        if (update_interval != 'None') {
            if (single != true) {
                setTimeout(chat_update, update_interval);
            }
        }


    }, 'json');



}

//sound code

function playSound(sound) {
    if (soundsEnabled) {
        try {
            $('#' + sound + 'Sound').trigger("play");
        }
        catch (err) {
            if (feature_debug) {
            console.log(err);}
            return false;
        }
        return true;
    }
    return false;
}

// modal code begins

function uiToggle(ui) {
    var uiSelected = $('#' + ui);
    if(uiSelected.css('display') == 'none') {
        $('.modal').hide();
        uiSelected.show();
        $('#modal-background').show();
    }
    else {
        $('.modal').hide();
        $('#modal-background').hide();
    }

}

//URL modal

$(function() {
    $('#link-form').on('keyup', function(e) {
        if (e.which == 13 && ! e.shiftKey) {
            addUrl();
        }
    });
});

function addUrl() {
    var msgField = $('#msg-data');
    var cur = msgField.text();
    msgField.val(cur + '[link]' + $('#link-form').val() + '[/link]');
    uiToggle('link');
}

function addImage() {
    var msgField = $('#msg-data');
    var cur = msgField.text();
    msgField.val(cur + '[image]' + $('#image-form').val() + '[/image]');
    uiToggle('image');
}


//Code modal

$(function() {
    $('#url-form').on('keyup', function(e) {
        if (e.which == 13 && ! e.shiftKey) {
            addUrl();
        }
    });
});

function addCode() {
    var msgField = $('#msg-data');
    var cur = msgField.text();
    msgField.val(cur + '[code]' + $('#code-form').val() + '[/code]');
    uiToggle('code');
}


$(document).keypress(function (e) {
    if (e.which == 13) {
        if (document.getElementsByName('msg-data')[0].value != '') {
            send_msg(document.getElementsByName('msg-data')[0].value);
            document.getElementsByName('msg-data')[0].value = '';
        }
    }
});

// Invite modal

$(function() {
    $('#inv-msg').on('keyup', function(e) {
        if (e.which == 13 && ! e.shiftKey) {
            inviteUser();
        }
    });
});

$(function() {
    $('#recipient').on('keyup', function(e) {
        if (e.which == 13 && ! e.shiftKey) {
            inviteUser();
        }
    });
});

function inviteUser() {
    var recipient = $('#recipient');
    var invMsg = $('#inv-msg');
    var session = {'_token': getCookie(chat_id), '_recipient': recipient.val(), '_msg': invMsg.val()};
    $.post('/api/' + chat_id + '/inviteUser', session, function (result) { }, 'json');
    uiToggle('invite');
    recipient.val(' ');
    invMsg.val(' ');
}

// Admin modal

function setUsers() {
    var select = $('#admin-user-list');

    $.each(userStore, function(key, value) {
        if ($.inArray(value, userViewed) < 0) {
            userViewed.push(value);
     select.append($("<option title='" + key + "'></option>")
                    .attr("value",key)
                    .text(value)); }
});


}

function admin_exec(func) {
    var session = {'_token': getCookie(chat_id), '_user': $('#admin-user-list').find('option:selected').text()};
    $.post('/api/' + chat_id + '/' + func, session, function (result) { }, 'json');

}


function imHere() {
    if ((presenceUpdated <= new Date().getTime() - 30000) || (presenceUpdated == false)) {
        if (feature_debug == true) {
            console.log('Sending presence update')
        }
    var session = {'_token': getCookie(chat_id)};
    $.post('/api/' + chat_id + '/im-here', session, function () {
        presenceUpdated = new Date().getTime();
    }, 'json');
} }


// modal code ends


if (typeof chat_id !== 'undefined') {
    checkAdmin();
    diffieHellman();
    imHere();
}
