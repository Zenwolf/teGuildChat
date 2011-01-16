function promptUserName() {
    return prompt("Please enter a user name")
}

function message(obj) {
    var el = document.createElement('p')
    if ('announcement' in obj) {
        el.innerHTML = '<em>' + esc(obj.announcement) + '</em>'
    }
    else if ('message' in obj) {
        var vals = obj.message
        el.innerHTML = '<b>' + esc(vals.userName) + ':</b> ' + esc(vals.message)
    }
    document.getElementById('chat').appendChild(el)
    document.getElementById('chat').scrollTop = 1000000
}

function send() {
    var val = document.getElementById('text').value
      , nameVal = document.getElementById('username').value
      , userName = (nameVal === '') ? 'Default' : nameVal

    socket.send({ event : 'user_message', message : {'userName' : userName, 'message' : val} })
    message({ event : 'user_message', message : {'message': val, userName: 'you' } })
    document.getElementById('text').value = ''
}

function esc(msg) {
  return String(msg).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

var socket = new io.Socket(null, {port: 8080, rememberTransport: false})
socket.connect()
socket.on('message', function(obj) {
    if (obj.event === 'user_error_duplicate') {
        message(obj)
        handleUserName()
        return
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

function handleUserName() {
    var input = document.getElementById('username').value = promptUserName()
    socket.send({ event : 'user_connected', userName : input, announcement : input + " entered the chat room." })
}

document.addEventListener( "DOMContentLoaded", handleUserName, false)
