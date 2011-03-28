/*
 * Dependencies
 *
 */
 
var express  = require( 'express' )
  , connect  = require( 'connect' )
  , io       = require( 'socket.io' )
  , mongoose = require( 'mongoose' )
  , Account  = require( './models/account.js' )
  , userUtil = require( './userUtil.js' )
  , http     = require( 'http' )
  , errors   = require( './errors.js' )


/*
 * Application properties.
 *
 */
var pubDir  = __dirname + '/public' // default value, otherwise from config
  , viewDir = __dirname + '/views'  // default value, otherwise from config
  , dbHost  = 'http://localhost/db'
  , port    = 80


/*
 * Create the app server
 *
 */
 
var app = express.createServer()

/*
 * Account stuff
 *
 */

var loadAccount = function( req, callback ) {
    if ( !authenticated ) {
        callback( null )
        return
    }
    // load the user info from db
}


/*
 * Routes
 *
 */
app.get( '/', function(req, res) {
    var errorMsg = errors[ req.query.error ]
    res.render( 'login', { title : 'TE Guild Chat Login'
                        , styles : { common : '/css/common.css'
                                   , login  : '/css/login.css'
                                   }
                        , error  : (errorMsg) ? errorMsg : undefined
                        } )
})


app.get( '/chat', function(req, res) {
    console.log( req )
    res.render( 'chat', { title: 'TE Guild Chat'
                       , port     : port
                       , styles   : { common : '/css/common.css'
                                    , chat   : '/css/style.css'
                                    }
                       , userName : req.query.userName
                       } )
})


app.get( '/login', function() {
    res.render( 'login', { title  : 'TE Guild Chat Login'
                         , styles : { common : '/css/common.css'
                                    , login  : '/css/login.css'
                                    }
                         } )
} )


/*
 * Open ID Authenticate
 *
 */

app.get( '/auth', function ( req, res ) {
    var identifier = 'https://www.google.com/accounts/o8/id'
    userUtil.authenticate( id, function(authUrl) {
        if (!authUrl) {
            res.writeHead( 500 )
            res.end( error )
            return
        }
        res.redirect( authUrl )
    } )
} )

app.get( '/verify', function () {
    userUtil.verifyAssertion( req, function( result ) {
        // result:
        // - authenticated : boolean
        // - error : message, only if not authenticated
        // - answers : from extensions

        if ( !result.authenticated ) {
            res.writeHead( 500 )
            res.end( result.error )
            return
        }

        // save the authenticated info
        
        
        
        // redirect to /:username
    } )
} )


/*
 * Configure the application.
 * Pass in an app config object (key/val)
 */
function configure( appCfg ) {
    console.log( [ "App config:"
                 , appCfg
                 ] )
    // assign the app props from config
    viewDir = appCfg.viewDir || viewDir
    pubDir  = appCfg.pubDir  || pubDir
    dbHost  = appCfg.dbHost  || dbHost
    port    = appCfg.port    || port

    app.configure( function() {
        app.set( 'views', viewDir )
        app.set( 'view engine', 'jade' )
        app.set( 'view options', { layout : false } )
        app.use( express.static( pubDir ) )
        app.use( express.bodyParser() )
        app.use( express.methodOverride() )
        app.use( express.cookieParser() )
        app.use( express.session( { secret : 'fooSecret' } ) )
    } )

    app.configure('development', function() {
        app.use( express.errorHandler( { dumpExceptions: true
                                       , showStack: true
                                       } )) 
    })

    app.configure('production', function() {
        app.use( express.errorHandler() )
    })
}


/*
 * start application.
 *
 */
function start() {
//    mongoose.connect( dbHost ) // Connect to the database.
    app.listen( port )
    console.log( "Server listening on port %d", app.address().port )
}


/*
 * Exports
 *
 */
exports.configure = configure
exports.start = start


/*
 * Messaging stuff
 *
 */

// TODO move messaging stuff into a separate module
// TODO refactor all this crap into separate objects.
// TODO add timestamps
// TODO add list of users in the chat room
// TODO fix "foo entered the chat room" msg

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
//    history(notice)
    client.broadcast(notice)

    client.on('message', function(message) {
        console.log(message)
        handlers[message.event](client, message)
    })

    client.on('disconnect', function() {
        var username = sessions[client.sessionId+''].userName
          , sid = client.sessionId
          , notice = { event : 'system_message', 'userName' : username, 'announcement' : sid + ' disconnected' }
        
        handlers['user_disconnected'](client, { userName : username })
//        history(notice)
        client.broadcast(notice)
        delete users[username]
        delete sessions[sid]
    })
})
