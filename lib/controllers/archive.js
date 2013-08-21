module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/post/:id/?'
}

const posts = require('../posts')

function handler (context, callback) {
  function nopost () {
    context.response.writeHead(303, {
      'location': 'http://nodejs.org.au/'
    })
    context.response.end()
  }

  posts(function (err, posts) {
    if (err) {
      console.error(err)
      return nopost()
    }

    posts = posts.filter(function (post) {
      return post.number == context.params.id
    })

    if (!posts.length)
      return nopost()

    context.model.post = posts[0]
    context.model.title = posts[0].title
    callback(null, 'archive-post')
  })
}