var socket = undefined

function getUserName() {
    return document.getElementById( 'userName' ).value
}

function message(obj) {
    var el = document.createElement('p')
      , chat = document.getElementById( 'chat' )

    if ('announcement' in obj) {
        el.innerHTML = '<em>' + esc(obj.announcement) + '</em>'
    }
    else if ('message' in obj) {
        var vals = obj.message
        el.innerHTML = '<b>' + esc(vals.userName) + ':</b> ' + esc(vals.message)
    }
    chat.appendChild(el)
    chat.scrollTop = 1000000
}

function send() {
    var val = document.getElementById('text').value
      , nameVal = getUserName()
      , userName = (nameVal === '') ? 'Default' : nameVal

    socket.send({ event : 'user_message', message : {'userName' : userName, 'message' : val} })
    message({ event : 'user_message', message : {'message': val, userName: 'you' } })
    document.getElementById('text').value = ''
}

function esc(msg) {
    return String(msg).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sendUserName() {
    var userName = getUserName()
    socket.send({ event : 'user_connected', 'userName' : userName, announcement : userName + " entered the chat room." })
}

function setUp() {
    var port = document.getElementById( 'tePort' ).value
    socket = new io.Socket(null, {port: parseInt( port, 10 ) || 80, rememberTransport: false})
    socket.connect()
    socket.on('message', function(obj) {
        if (obj.event === 'user_error_duplicate') {
            message(obj)
            // send user back to login page with message.
            window.location.href = '/?error=dupe'
            return
        }
        if (obj.event === 'system_init') {
            sendUserName()
        }
        if ('buffer' in obj) {
            document.getElementById('form').style.display='block'
            document.getElementById('chat').innerHTML = ''
        
            for (var i in obj.buffer) {
                message(obj.buffer[i])
            }
        }
        else {
            message(obj)
        }
    })
}

document.addEventListener( "DOMContentLoaded", setUp, false)
