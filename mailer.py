import requests
import config

config = config.configurationData('mailer')


def invite_user(sender, recipient, message, chat):
    request_url = 'https://api.mailgun.net/v2/{0}/messages'.format(config.url)
    request = requests.post(request_url, auth=('api', config.key), data={
    'from': 'chat-invite@noreply.qtmsg.io',
    'to': recipient,
    'subject': 'Chat Invite from ' + sender + ' for ' + chat,
    'text': sender + ' has invited you to ' + chat + '\n\n    ' + sender + ": " + message + "\n\n" + "To join vist: https://qtmsg.io/login/" + chat
})