var npm     = require('npm')
  , async   = require('async')
  , request = require('request')
  , ghauth  = require('./ghauth')

  , GITHUB_USER_API_URL = 'https://api.github.com/users/{user}'
  , AU_LOCATION_REGEX   = /\Wau(s|st)?\W|australia|sydney|melbourne|brisbane|perth|darwin|adelaide|canberra/i
  , AU_BLOG_REGEX       = /\.au$/i
  , GITHUB_REPO_REGEX   = /github.com[:\/]([\.\-\w]+)\/([^$\/\.]+)/

  , ghconfig            = {}

  , loadRepoList = function (callback) {
      var repos = []

      npm.load(function () {
        npm.registry.get('/-/all', function (err, data) {
          Object.keys(data).forEach(function (k) {
            var match = data[k].repository && typeof data[k].repository.url == 'string' && data[k].repository.url.match(GITHUB_REPO_REGEX)
            if (match) {
              repos.push({ user: match[1], repo: match[2] })
            }
          })
          callback(null, repos)
        })
      })
    }

  , processUser = function (user, callback) {
      var opts = {
              url: GITHUB_USER_API_URL.replace('{user}', user)
            , headers: { Authorization:  "Basic " + new Buffer(ghconfig.ghUser + ":" + ghconfig.ghPass).toString('base64') }
          }
        , handle = function (err, response, body) {
            if (err)
              return callback('Error requesting repo data from GitHub for ' + user + ': ' + err)
            callback(null, JSON.parse(body))
          }
      request(opts, handle)
    }

loadRepoList(function (err, repos) {
  var users = []
  repos.forEach(function (repo) {
    if (users.indexOf(repo.user) == -1) users.push(repo.user)
  })
  console.log('Found', users.length, 'users')
  ghauth(ghconfig, function (err) {
    if (err) return console.log('ERROR', err)
    async.forEach(users, function (user, callback) {
      processUser(user, function (err, data) {
        if (!err && data) {
          if (data.message && !(/Not found/i).test(data.message)) {
            console.log('Error (' + user + '): ' + data.message)
          } else if ((data.location && AU_LOCATION_REGEX.test(data.location)) || (data.blog && AU_BLOG_REGEX.test(data.blog))) {
            var data = [ user, data.location, data.blog || '' ]
            console.log('"' + data.join('", "') + '"')
          }
        }
        callback()
      })
    })
  })
})