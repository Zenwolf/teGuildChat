var mongoose = require( 'mongoose' )

/*
 * Account database model.
 *
 */
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  
var AccountSchema = new Schema( {
    username     : String
  , email        : String
  , date         : Date
  , type         : Number
  , admin        : Number
  , bnetCharUrl  : String
} )

var Account = mongoose.model( 'Account', AccountSchema )
exports.Account
