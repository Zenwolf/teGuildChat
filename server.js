// Dependencies
var express = require('express')
  , connect = require('connect')
  , io = require('socket.io')
  , http = require('http')


// create the app server
var pub = __dirname + '/public'
  , app = express.createServer(
        express.static( pub )
    )


// Configure app
app.configure( function() {
    app.set( 'views', __dirname + '/views' )
    app.set( 'view engine', 'jade' )
    app.use( express.bodyParser() )
    app.use( express.methodOverride() )
    app.use( express.cookieParser() )
//    app.use( app.router )
})


app.configure('development', function() {
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } )) 
})

app.configure('production', function() {
    app.use( express.errorHandler() )
})

// Routes
app.get('/', function(req, res) {
    res.render('index', {
        locals: { title: 'TE Guild chat' }
    })
})

var port = process.env.PORT || 8080
app.listen( port )

var io = io.listen(app)
  , buffer = []
  , users = {} // username to session id mapping
  , sessions = {} // session id to data mapping
  , handlers = {
        'user_connected' : function(client, msg) {
            var userName = msg.userName
            // if the username is already taken
            if (users[userName+'']) {
                client.send({ event : 'user_error_duplicate', announcement : "user name " + userName + " is already taken. Please choose another."})
                return
            }
            sessions[client.sessionId+''].userName = userName // map session id to username
            users[userName+''] = client.sessionId+'' // map username to session id
            var notice = { event : 'system_message', announcement : userName + " entered the chat room." }
            history(notice)
            client.broadcast(notice)
        }

        ,'user_message' : function(client, msg) {
            var vals = msg.message
              , userName = vals.userName
              , userMsg = vals.message
              , output = { event : 'user_message', 'message' : {userName : userName, message : userMsg} }
            history(output)
            client.broadcast(output)
        }
        
        ,'user_disconnected' : function(client, msg) {
            var userName = msg.userName
              , notice = { event : 'system_message', announcement : userName + " left the chat room." }
            history(notice)
            client.broadcast(notice)
        }
    }

function history(obj) {
    buffer.push(obj)
    if (buffer.length > 25) buffer.shift()
}

io.on('connection', function(client) {
    sessions[client.sessionId+''] = {} // create the data object for this session
    client.send({ event : 'user_message', 'buffer' : buffer })
    var notice = { event : 'system_message', announcement: client.sessionId + ' connected' }
    history(notice)
    client.broadcast(notice)

    client.on('message', function(message) {
        console.log(message)
        handlers[message.event](client, message)
    })

    client.on('disconnect', function() {
        var username = sessions[client.sessionId+''].userName
          , sid = client.sessionId
          , notice = { event : 'system_message', userName : username, announcement: sid + ' disconnected' }
        
        handlers['user_disconnected'](client, { userName : username })
        history(notice)
        client.broadcast(notice)
        delete users[username]
        delete sessions[sid]
    })
})

console.log( "Express server listening on port %d", app.address().port )
