keytable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+{}|:;<>?,. "


def encode_string(pw,string):

    while len(str(pw)) < len(string):
        pw = pw + pw

    pw = list(str(pw))
    string = list(string)
    output = str()
    for i in range(len(string)):
        key = keytable.index(string[i]) + int(pw[i])
        if key < len(keytable):
            key = keytable[key]
        else:
            key = key - len(keytable)
            key = keytable[key]
        output = output + key
    return output


def decode_string(pw,string):

    while len(str(pw)) < len(string):
        pw = pw + pw

    pw = list(str(pw))
    string = list(string)
    output = str()

    for i in range(len(string)):
        key = keytable.index(string[i]) - int(pw[i])
        print key
        if key > 0:
            key = keytable[key]
        else:
            key = keytable[key + len(keytable)]
        output = output + key
    return output


print encode_string('5159209224639','Gcui6XEeiNhtfpK5O7BKsueOvj8T3x71vYUVbdZeR4hc4niOS')