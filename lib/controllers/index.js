module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/'
}

const staticData = require('../static-data')

const twitterMapping = staticData.twitterMapping
    , auUserData     = require('../au-user-data')()
    , posts          = require('../posts')

function handler (context, callback) {
  if (context.request.headers.host
      && (/nodejsau\.jit\.su/i).test(context.request.headers.host)) {

    context.response.writeHead(303, {
      'location': 'http://nodejs.org.au/'
    })
    return context.response.end()
  }

  context.model.users = auUserData()
  context.model.twitterMapping = twitterMapping

  context.model.companies = staticData.companies
  context.model.meetups = staticData.meetups

  posts(function (err, posts) {
    if (err)
      console.error(err) // otherwise ignore
    context.model.posts = posts
    callback(null, context.model.users ? 'index' : 'loading')
  })
}
