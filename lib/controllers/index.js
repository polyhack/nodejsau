module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/'
}

const twitterMapping = require('../static-data').twitterMapping
    , auUserData     = require('../au-user-data')()
    , posts          = require('../posts')

function handler (callback) {
  var context = { model : this.model }

  context.model.users = auUserData()
  context.model.twitterMapping = twitterMapping

  posts(function (err, posts) {
    if (err)
      console.error(err) // otherwise ignore
    context.model.posts = posts
    callback(null, context.model.users ? 'index' : 'loading')
  })
}