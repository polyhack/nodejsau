const twitterMapping = require('../static-data').twitterMapping

var config = {
        category : 'controller'
      , route    : '/'
      , depends  : [ 'auUserData' ]
    }

  , handler = function () {
      this.model.users = this.auUserData()
      this.model.twitterMapping = twitterMapping
      return this.model.users ? 'index' : 'loading'
    }

module.exports = handler
module.exports.__meta__ = config