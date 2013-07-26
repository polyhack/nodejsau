module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/atom.xml'
}

const posts = require('../posts')

function handler (context, callback) {
  context.model.date = new Date()
  context.response.setHeader('content-type', 'application/xml')

  posts(function (err, posts) {
    if (err)
      console.error(err) // otherwise ignore
    context.model.posts = posts
    callback(null, 'atom')
  })
}