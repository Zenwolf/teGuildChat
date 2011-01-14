function promptUserName() {
    return prompt("Please enter a user name")
}

function message(obj) {
    var el = document.createElement('p')
    if ('announcement' in obj) {
        el.innerHTML = '<em>' + esc(obj.announcement) + '</em>'
    }
    else if ('message' in obj) {
        el.innerHTML = '<b>' + esc(obj.message[0]) + ':</b> ' + esc(obj.message[1])
    }
    document.getElementById('chat').appendChild(el)
    document.getElementById('chat').scrollTop = 1000000
}

function send() {
    var val = document.getElementById('text').value
      , nameVal = document.getElementById('username').value
      , userName = (nameVal === '') ? 'Default' : nameVal
    socket.send( [userName
                 , val].join(":") )
    message( { message: ['you', val] } )
    document.getElementById('text').value = ''
}

function esc(msg) {
  return String(msg).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

var socket = new io.Socket(null, {port: 8080, rememberTransport: false})
socket.connect()
socket.on('message', function(obj) {
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

document.addEventListener( "DOMContentLoaded", function() {
    document.getElementById('username').value = promptUserName()
}, false)
