var fs      = require('fs')
  , path    = require('path')
  , npm     = require('npm')
  , async   = require('async')
  , request = require('request')
  //, ghauth  = require('./ghauth')
  , polyhackbot = require('polyhackbot')
  , polyhackbotSecrets = {
        'ntwitter': JSON.parse(process.env.NTWITTER)
      , 'ircPassword': process.env.FREENODE_PASS
    }
  , version  = require('./package').version

  , GITHUB_USER_API_URL = 'https://api.github.com/users/{user}'
  , AU_LOCATION_REGEX   = /\Wau(s|st)?\W|australia|sydney|melbourne|brisbane|perth|darwin|adelaide|canberra|\W(nsw|vic|qld|new south wales|victoria|queensland|western australia|northern territory|south australia|tasmania)\W/i
  , AU_BLOG_REGEX       = /\.au$/i
  , GITHUB_REPO_REGEX   = /github.com[:\/]([\.\-\w]+)\/([^$\/\.]+)/
  //, GITHUB_AUTHORIZATION_NOTE = 'nodejs.org.au'
  , DATA_STORE          = path.join(__dirname, '.userdata.json')
  , TWITTER_MAPPING_STORE = path.join(__dirname, 'twittermapping.json')
  , IGNORE_USER_STORE     = path.join(__dirname, 'ignoreusers.json')

  , requestPool         = { maxSockets: 20 }
  , ghconfig            = { token: process.env.GHTOKEN }
  , userData
  , twitterMapping
  , ignoreUsers

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
              url     : GITHUB_USER_API_URL.replace('{user}', user)
            , headers : { Authorization: 'token ' + ghconfig.token }
            , json    : true
            , pool    : requestPool
          }
        , handle = function (err, response, body) {
            if (err) return callback('Error requesting repo data from GitHub for ' + user + ': ' + err)
            callback(null, body)
          }

      request(opts, handle)
    }

    /*
    TODO: reenable this if the ghtoken doesn't exist
  , generateToken = function (callback) {
      ghauth(ghconfig, function (err) {
        if (err) return callback(err)
        ghauth.createAuth(ghconfig.ghUser, ghconfig.ghPass, GITHUB_AUTHORIZATION_NOTE, function (err, data) {
          if (err) return callback(err)
          if (!data || !data.token) return callback('Couldn\'t generate GitHub authorization token')
          callback(null, data.token)
        })
      })
    }
    */

  , isAustralian = function (data) {
      if (data.location && AU_LOCATION_REGEX.test(data.location)) return true
      if (data.blog && AU_BLOG_REGEX.test(data.blog)) return true
      return false
    }

  , fetchData = function (callback) {
      loadRepoList(function (err, repos) {
        var users   = []
          , auUsers = []

        repos.forEach(function (repo) {
          if (users.indexOf(repo.user) == -1 && ignoreUsers.indexOf(repo.user) == -1) {
            users.push(repo.user)
          }
        })
        //DEV:
        //users = users.slice(0, 100)
        console.log('Found', users.length, 'users')

        async.forEach(users, function (user, callback) {
          processUser(user, function (err, data) {
            var userRepos
            if (!err && data) {
              if (data.message && !(/Not found/i).test(data.message)) {
                console.log('Error (' + user + '): ' + data.message)
              } else if (isAustralian(data)) {
                userRepos = repos
                  .filter(function (r) { return r.user == user })
                  .map(function (r) { return r.repo })
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
                  , repos    : userRepos
                  , fetched  : new Date()
                })
              }
            }
            callback()
          })
        }, function (err) { callback(err, auUsers) })
      })
    }

  , loadStartupData = function (location, callback) {
      try {
        return callback(null, JSON.parse(fs.readFileSync(location)))
      } catch (e) {
        callback(e)
      }
    }

  , loadUserDataStore = function (callback) {
      loadStartupData(DATA_STORE, function (err, data) {
        if (err || !data || !data.length) {
          fetchData(function (err, data) {
            if (err) return callback(err)
            fs.writeFile(DATA_STORE, JSON.stringify(data), function (err) {
              userData = data
              return callback(err)
            })
          })
        } else {
          userData = data
          callback()
        }
      })
    }

  , loadTwitterMappingStore = function (callback) {
      loadStartupData(TWITTER_MAPPING_STORE, function (err, data) {
        if (err) return callback(err)
        twitterMapping = data
        callback()
      })
    }

  , loadIgnoreusersStore = function (callback) {
      loadStartupData(IGNORE_USER_STORE, function (err, data) {
        if (err) return callback(err)
        ignoreUsers = data
        callback()
      })
    }

  , escape = function (s) {
      return String(s)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

// these are all sync
async.parallel([
    loadUserDataStore
  , loadTwitterMappingStore
  , loadIgnoreusersStore
], function (err) {
  if (err) return console.log('ERROR:', err)
  console.log('Loaded data')
})

function index(req, res, next) {
  if ('/' != req.url) return next();
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'max-age=0' });
  res.write('<!doctype html>\n')
  res.write('<html><head>\n')
  res.write('<title>NodeJS.au</title>\n')
  res.write('<link rel="stylesheet" type="text/css" href="bootstrap.min.css">\n')
  res.write('<link rel="stylesheet" type="text/css" href="style.css">\n')
  res.write('</head><body>\n')
  res.write('<table class="table table-striped"><thead><tr><th>\n')
  res.write([ '', 'Name', 'GitHub', 'Twitter', 'Location', 'Blog', 'Company', 'Hireable' ].join('</th><th>'))
  res.write('</th></tr></thead><tbody>\n')
  userData && userData.forEach(function (user) {
    var twitter = twitterMapping[user.user]
    res.write('<tr>')
    res.write('<td><img src="' + user.avatar + '" width=64 height=64></td>')
    res.write('<td>' + escape(user.name || '')+ '</td>')
    res.write('<td><a href="' + encodeURI(user.github) + '">' + escape(user.user) + '</a></td>')
    res.write('<td>' + (twitter ? '<a href="https://twitter.com/' + twitter + '">' + escape('@' + twitter) + '</a>': '') + '</td>')
    res.write('<td>' + escape(user.location || '')+ '</td>')
    res.write('<td>' + (user.blog ? '<a href="' + encodeURI(user.blog) + '">' + escape(user.blog) + '</a>' : '') + '</td>')
    //res.write('<td>' + (user.email ? '<a href="mailto:' + user.email + '">' + user.email + '</a>' : '') + '</td>')
    res.write('<td>' + escape(user.company || '')+ '</td>')
    res.write('<td>' + (user.hireable ? '<i class="icon-ok"></i>' : '') + '</td>')
    res.write('</tr>\n')
  })
  res.write('</tbody></table>\n')
  res.end('</body></html>\n')
}

var connect = require('connect')
var app = connect()
app.use(connect.static(__dirname + '/assets'))
app.use(index)
app.listen(8888)

console.log('Listening on http://localhost:8888/')

polyhackbot(polyhackbotSecrets, 'nodejsau@' + version)