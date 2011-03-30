/*
Timeline:
    Load.
    DocumentOnReady stuff.
    Poll for ready state.
    now.ready stuff.
    add the user.
*/


var chat = (function() {
    var initd    = false                    // initialized
      , username = undefined                // name entered by the user
      , rooms    = { general : "General" }  // chat rooms, id:name
      , STRING   = 'String'
      , ARRAY    = 'Array'
      , BOOLEAN  = 'Boolean'
      , ready    = false

    function start() {
        init()

        // poll for ready state
        ;(function poll() {
            if (!ready) {
                setTimeout( poll, 500 )
                return
            }
            // when it's ready, try to add the user
            addUser( username, function() {
                document.getElementById( 'form' ).style.display = 'block'
                document.getElementById( 'chat' ).innerHTML = ''
                document.getElementById( 'text' ).focus()
            })
        })()
    }

    function isReady( val ) {
        if ( typeof val === 'undefined' ) return ready
        if ( !is( BOOLEAN, val ) ) throw new Error( "val was not a Boolean" ) // error?
        ready = val
    }

    function is( type, obj) {
        var clas = Object.prototype.toString.call( obj ).slice( 8, -1 )
        return obj !== undefined && obj !== null && clas === type
    }
    
    function init() {
        if (initd) return

        now.name = username = loadUsername()
        now.roomId = 'general'

        now.receiveMsg = function( name, dateTime, msg ) {
            var elem = document.createElement( 'p' )
              , output = document.getElementById( 'chat' )
              , n = (now.name === name) ? 'You' : name
              , t = dateTime || '[??:??:??]'

            elem.innerHTML = [ '<span class="dateTime">'
                             , t
                             , '</span>'
                             , ' <b>'
                             , n
                             , ':</b> '
                             , '<span class="msg">'
                             , msg
                             , '</span>'
                             ].join('')
            output.appendChild( elem )
            output.scrollTop = 1000000
        }

        now.receiveSystemMsg = function( msg ) {
            var elem = document.createElement( 'p' )
              , output = document.getElementById( 'chat' )

            elem.innerHTML = '<em>' + msg + '</em>'
            output.appendChild( elem )
            output.scrollTop = 1000000
        }
    }

    function addUser( username, callback ) {
        var valid = isUsernameValid( username )
        if (!valid) loginError( 'invalid' )

        now.addUser( username, function( success ) {
            if (!success) {
                loginError( 'dupe' )
                return
            }
            if (callback) callback()
        })
    }

    //> private String loadUsername()
    function loadUsername() {
        return document.getElementById( 'userName' ).value
    }

    //> private boolean isUsernameValid( String username )
    function isUsernameValid( username ) {
        if ( !is( STRING, username ) ) return false
        username.replace(/[\s\xA0]+/g, '')
        if ( username === '' ) return false
        return true
    }

    //> private void doesUsernameExist( String name )
    function doesUsernameExist( name ) {
        if ( now.users[ name ] ) loginError( 'dupe' )
    }

    //> private void loginError( String errorId )
    function loginError( errorId ) {
        window.location.href = '/?error=' + errorId
    }

    /*
     * Send a message from users to users.
     *
     */
    function msg() {
        var elem = document.getElementById( 'text' )
          , m = elem.value
          
        if ( m === '' ) return
        now.distributeMsg( m )
        elem.value = ''
    }

    /*
     * Return the public API.
     *
     */
    return { start   : start
           , msg     : msg
           , isReady : isReady
           }
}())


/*
 * Listener for now.ready
 *
 */
now.ready( function() {
    chat.isReady( true )
})


/*
 * DOM listener
 *
 */
document.addEventListener( "DOMContentLoaded", function() {
    chat.start()
}, false)

