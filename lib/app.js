/*
 * Dependencies
 *
 */
 
var express   = require( 'express' )
  , connect   = require( 'connect' )
  , mongoose  = require( 'mongoose' )
  , Account   = require( '../models/account.js' )
  , userUtil  = require( './userUtil.js' )
  , http      = require( 'http' )
  , errors    = require( './errors.js' )


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
//    console.log( req )
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
//    messaging.init( app )
    console.log( "Server listening on port %d", app.address().port )
}


/*
 * Exports
 *
 */
exports.configure = configure
exports.start = start


/*
 * Messaging
 *
 */
var everyone = require( 'now' ).initialize( app )
everyone.now.users = {}

everyone.connected( function() {
    console.log( "Joined: " + this.now.name )
//    var n = this.now.name
//    everyone.now.users[ n.toLowerCase() ] = n
})

everyone.disconnected( function() {
    var n = this.now.name
    if (!n) return
    console.log( "Left: " + n)
    everyone.now.receiveSystemMsg( n + " left the " + this.now.roomId + " room." )
    delete everyone.now.users[ n ]
})

everyone.now.distributeMsg = function( msg ) {
    everyone.now.filterMsg( this.now.name, msg, this.now.roomId )
    //everyone.now.receiveMsg( this.now.name, msg )
}

everyone.now.filterMsg = function( name, msg, targetRoomId ) {
    //console.log( targetRoomId + ", " + this.now.roomId )
    if (targetRoomId === this.now.roomId) {
        var d = new Date()
          , dateTime = '[' + d.toLocaleTimeString() + ']'
        this.now.receiveMsg( name, dateTime, msg )
    }
}

everyone.now.doesUserExist = function( username, callback ) {
    callback( everyone.users[username] ? true : false )
}

everyone.now.addUser = function( name, callback ) {
    var users = everyone.now.users
    if (!name) return

    if ( users[ name ] ) {
        callback( false )
        return
    }
    users[ name ] = name
    callback( true )
    everyone.now.receiveSystemMsg( name + " joined the " + this.now.roomId + " room." )
}


