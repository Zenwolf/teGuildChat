// Dependencies
var express = require('express')
  , app = module.exports = express.createServer()
  , io = require('socket.io')
  , http = require('http')

// Configuration
app.configure( function() {
    app.set( 'views', __dirname + '/views' )
    app.set( 'view engine', 'jade' )
    app.use( express.bodyDecoder() )
    app.use( express.methodOverride() )
    app.use( app.router )
    app.use( express.staticProvider(__dirname + '/public') )
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
        locals: { title: 'Express' }
    })
})

app.listen(8080);

var io = io.listen(app)
  , buffer = []

io.on('connection', function(client) {
    client.send( { buffer: buffer } )
    client.broadcast({ announcement: client.sessionId + ' connected' })
  
    client.on('message', function(message) {
        console.log(message.toString())
        var vals = parseMsg(message)
        var msg = { message: [ [vals[0]
                               , ' ('
                               , client.sessionId
                               , ')'].join('')
                             , vals[1] ]}
        buffer.push(msg)
        if (buffer.length > 25) buffer.shift()
        client.broadcast(msg)
    })

    client.on('disconnect', function() {
        client.broadcast( { announcement: client.sessionId + ' disconnected' } )
    })
})

function parseMsg(message) {
    return message.split(':')
}

console.log( "Express server listening on port %d", app.address().port )
