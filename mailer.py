import requests

key = 'key-4bc35a0f63ccc1c1efb16dffb67f248f'
domain = 'noreply.qtmsg.io'
url = 'noreply.qtmsg.io'


def invite_user(sender, recipient, message, chat):
    request_url = 'https://api.mailgun.net/v2/{0}/messages'.format(url)
    request = requests.post(request_url, auth=('api', key), data={
    'from': 'chat-invite@noreply.qtmsg.io',
    'to': recipient,
    'subject': 'Chat Invite from ' + sender + ' for ' + chat,
    'text': sender + ' has invited you to ' + chat + '\n\n    ' + sender + ": " + message + "\n\n" + "To join vist: https://qtmsg.io/login/" + chat
})