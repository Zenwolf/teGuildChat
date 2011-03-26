var openid   = require( 'openid' )
  , mongoose = require( 'mongoose' )
  , qstring  = require( 'querystring' )
  , url      = require( 'url' )


/*
 * Open ID stuff
 *
 */
var authenticated = false
var extensions = [ new openid.UserInterface()
                 , new openid.SimpleRegistration(
                    { "nickname" : true
                    , "email" : true
                    , "fullname" : true
                    , "dob" : true
                    , "gender" : true
                    , "postcode" : true
                    , "country" : true
                    , "language" : true
                    , "timezone" : true
                    }
                 )
                 , new openid.AttributeExchange(
                    { "http://axschema.org/contact/email": "required"
                    , "http://axschema.org/namePerson/friendly": "required"
                    , "http://axschema.org/namePerson": "required"
                    }
                 )]

var relyingParty = undefined

function configure( verifyUrl ) {
    relyingParty = new openid.RelyingParty(
        'http://localhost:8080/verify' // Verification URL (yours)
      , null                           // Realm (optional, specifies realm for OpenID authentication)
      , false                          // Use stateless verification
      , false                          // Strict mode
      , extensions                     // List of extensions to enable and include
    )
}

function isAuthenticated() {
    return authenticated
}

/*
 * id is a Google id
 * callback function takes authUrl
 *
 */
function authenticate( id, callback ) {
    relyingParty.authenticate( id, false, callback )
}

/*
 * callback function takes result
 *
 */
function verifyAssertion( req, callback ) {
    relyingParty.verifyAssertion( req, callback )
}

/*
 * Export stuff
 *
 */
exports.configure       = configure
exports.isAuthenticated = isAuthenticated
exports.authenticate    = authenticate
exports.verifyAssertion = verifyAssertion
