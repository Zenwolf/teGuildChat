/*
 * Dependencies
 *
 */
 
var config   = require( './config' )
  , io       = require( 'socket.io' )
  , http     = require( 'http' )
  , app      = require( './app.js' )


/*
 * Load server config.
 *
 */
 // TODO use config module
var devCfg = { port      : process.env.PORT || 8080
             , authUrl   : 'http://localhost:8080/auth'
             , verifyUrl : 'http://localhost:8080/verify'
             , dbHost    : 'http://localhost/db'
             , viewDir   : __dirname + '/views'
             , pubDir    : __dirname + '/public'
             }


var serverCfg = { port      : process.env.PORT || 80
                , authUrl   : 'http://zenwolf.no.de/auth'
                , verifyUrl : 'http://zenwolf.no.de/verify'
                , dbHost    : 'http://localhost/db'
                , viewDir   : __dirname + '/views'
                , pubDir    : __dirname + '/public'
                }

 
/*
 * Create the application config from server settings and whatever else.
 * Flexible, and lets us pick up new values from server at runtime.
 * // TODO Using dev config for now.
 */
var appCfg = { authUrl   : devCfg.authUrl
             , verifyUrl : devCfg.verifyUrl
             , viewDir   : devCfg.viewDir
             , pubDir    : devCfg.pubDir
             , dbHost    : devCfg.dbHost
             , port      : devCfg.port
             }

// Configure the app.
// TODO add app update config functionality???
app.configure( appCfg )


// Start the server.
app.start()


/*
 * Load the config
 *
 */

/*
var cfg = undefined

config.configFile( cfgFileName, function( config, oldConfig ) {
    if ( !config ) {
        throw new Error( "Config is missing." )
    }
    that.cfg = config
}
*/

