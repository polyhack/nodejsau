const githubUrl  = 'https://api.github.com/repos/polyhack/nodejsau/issues?state=open'
    , hyperquest = require('hyperquest')
    , bl         = require('bl')
    , brucedown  = require('brucedown')
    , map        = require('map-async')
    , ttl        = 1000 * 60 // 1 min
    , authorised = require('../authorised_users')

var data

function loadPosts (callback) {
  if (data && data.timestamp < Date.now() - ttl)
    return process.nextTick(callback.bind(null, null, data.posts))

  hyperquest(githubUrl).pipe(bl(function (err, _body) {
    if (err)
      return callback(err)

    var body, posts

    try {
      body = JSON.parse(_body.toString())
    } catch (e) {
      return callback(e)
    }
    if (body.message)
      return callback(new Error(body.message))
    if (!Array.isArray(body))
      return callback(new Error('unexpected response from GitHub'))

    posts = body.filter(function (issue) {
      return (
           issue.user
        && authorised.indexOf(issue.user.login) > -1
        && issue.title
        && (/^post:/i).test(issue.title)
        && issue.body
      )
    }).map(function (issue) {
      return {
          url: issue.html_url
        , title: issue.title.replace(/^post:\s*/i, '')
        , user: { login: issue.user.login, avatar: issue.user.avatar_url }
        , date: new Date(issue.created_at)
        , body: issue.body
      }
    })

    map(
        posts
      , function iterator (post, i, callback) {
          brucedown(post.body, function (err, html) {
            if (err)
              return callback(err)
            post.body = html
            callback(null, post)
          })
        }
      , callback
    )
  }))

}

/*
loadPosts(function (err, posts) {
  console.log(err, JSON.stringify(posts))
})
*/

module.exports = loadPosts