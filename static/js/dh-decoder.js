var keytable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+{}|:;<>?,. ";

function decodeKey(DhPw, input) {

    var output = '';

    while (input.length * 2 > String(DhPw).length) {
        DhPw = String(DhPw) + String(DhPw);
        console.log('Weak DH Key used.')
    }

    for (i = 0; i < input.length; i++) {
        var char = input[i];
        char = keytable.indexOf(char);
        char = char - parseInt(String(DhPw).substring(0,2));
        DhPw = DhPw.substr(2,DhPw.length );
        while (char < 0) {
            char = char + keytable.length;
        }

        char = keytable[char];
        output = output + char

    }

    return output;

}
