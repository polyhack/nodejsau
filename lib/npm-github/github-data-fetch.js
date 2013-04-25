const GITHUB_USER_API_URL = 'https://api.github.com/users/{user}'

const async        = require('async')
    , request      = require('request')

    , githubToken  = require('../static-data').githubToken
    , ignoreUsers  = require('../static-data').ignoreUsers
    , isDev        = require('../static-data').isDev
    , isAustralian = require('./is-aussie')
    , loadRepoList = require('./npm-github-repos')

    // throttle request a bit
var requestPool = { maxSockets: 20 }

    // for a given user, fetch their data from the GitHub API
  , fetchUserGithubData = function (user, callback) {
      var opts = {
              url     : GITHUB_USER_API_URL.replace('{user}', user)
            , headers : { Authorization: 'token ' + githubToken }
            , json    : true
            , pool    : requestPool
          }
        , handle = function (err, response, body) {
            if (err) return callback('Error requesting repo data from GitHub for ' + user + ': ' + err)
            callback(null, body)
          }
      opts.headers['user-agent'] = 'Wget/1.14 (linux-gnu)';
      request(opts, handle)
    }

    // for a given GitHub user's data, if we think they are Australian then collect interesting data
  , processUser = function (repos, auUsers, user, data, npmPackages) {
      //var userRepos
      if (data.message && !(/Not found/i).test(data.message)) {
        console.log('Error (' + user + '): ' + data.message)
      } else if (isAustralian(data)) {
        //userRepos = repos
        //  .filter(function (r) { return r.user == user })
        //  .map(function (r) { return r.repo })

        auUsers.push({
            user     : user
          , name     : data.name
          , location : data.location
          , blog     : data.blog ? (/http/i).test(data.blog) ? data.blog : 'http://' + data.blog : ''
          , avatar   : data.avatar_url
          , email    : data.email
          , company  : data.company
          , hireable : data.hireable
          , github   : data.html_url
          , packages : npmPackages
          , fetched  : new Date()
        })
      }
    }

  , sort = function (auUsers) {
      return auUsers.sort(function (u1, u2) {
        return u2.packages.length - u1.packages.length
      })
    }

  , fetcher = function (callback) {
      loadRepoList(function (err, repos, npmData) {
        var users   = []
          , auUsers = []

        repos.forEach(function (repo) {
          if (users.indexOf(repo.user) == -1 && ignoreUsers.indexOf(repo.user) == -1) {
            users.push(repo.user)
          }
        })

        if (isDev)
          users = users.slice(0, 100)

        var aliases = {}
        npmData.forEach(function (n) {
          if (!n.github || n.owners.length > 1) {
            return
          } else if (!(n.github in aliases)) {
            aliases[n.github] = {}
          }
          n.owners.forEach(function (maintainer) {
            aliases[n.github][maintainer] = true
          })
        })

        async.forEach(
            users
          , function (user, callback) {
              fetchUserGithubData(user, function (err, data) {
                if (err || !data) return callback()

                var user_lower = user.toLowerCase()
                  , user_aliases = user_lower in aliases ? aliases[user_lower] : {}
                user_aliases[user_lower] = true

                var npmPackages = npmData.filter(function (n) {
                    for (var i = 0, len = n.owners.length; i < len; i++) {
                        if (n.owners[i] in user_aliases) {
                            return true
                        }
                    }
                    return false
                })
                processUser(repos, auUsers, user, data, npmPackages)
                callback()
              })
            }
          , function (err) { callback(err, sort(auUsers)) }
        )
      })
    }

module.exports = fetcher
module.exports.__meta__ = {
    id: 'githubDataFetcher'
}
