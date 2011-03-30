/*
 * Dependencies.
 *
 */
var everyone = require( 'now' )
  , users    = {}

function init( server ) {
//    console.log( server )
    everyone.initialize( server )
//    console.log(everyone)
    setUp()
}

function setUp() {
    everyone.connected( function() {
        // TODO
    })

    everyone.disconnected( function() {
        // TODO
    })

    everyone.now.distributeMessage = function( msg ) {
        everyone.now.receiveMsg( this.now.name, message )
    }

    everyone.now.doesUserExist = function( username, callback ) {
        callback( users[username] ? true : false )
    }

    everyone.now.systemMsg = function( msg ) {
        everyone.now.receiveSystemMsg( msg )
    }
}

/*
 * Exports.
 *
 */
 exports.init = init
