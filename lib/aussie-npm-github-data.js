const AU_GITHUB_USERS_DATA_URL  = 'https://raw.github.com/polyhack/npm-github-data/master/githubusers_au.json'
    , ALL_NPM_PACKAGES_DATA_URL = 'https://raw.github.com/polyhack/npm-github-data/master/allpackages.json'

const request     = require('request')
    , async       = require('async')
    , ignoreUsers = require('./static-data').ignoreUsers

// download the latest data from github
function fetchData (url) {
  return function (callback) {
    request({ url: url, json: true, method: 'get'}, function (err, response, body) {
      if (err)
        return callback(err)

      return callback(null, body)
    })
  }
}

function processData (data, callback) {
  var auUsers = []
    , aliases = {}

  // collect aliases to map github user accounts to npm maintainer accounts
  // but this is a rough science since maintainership can be switched around in npm
  data.npmPackagesData.forEach(function (n) {
    if (!n.githubUser || n.maintainers.length > 1) {
      return
    } else if (!(n.githubUser in aliases)) {
      aliases[n.githubUser.toLowerCase()] = {}
    }
    n.maintainers.forEach(function (maintainer) {
      if (ignoreUsers.indexOf(maintainer.toLowerCase()) == -1)
        aliases[n.githubUser.toLowerCase()][maintainer.toLowerCase()] = true
    })
  })

  // now we do a reverse map against the npm data and find all the packages that
  // have an au user as a maintainer (or their alias)
  data.auGithubData.forEach(function (user) {
    var login       = user.login.toLowerCase()
      , userAliases = aliases[login] || {}
      , npmPackages

    if (auUsers.some(function (u) { return login == u.user_lc }))
      return // dupe

    if (ignoreUsers.indexOf(login) == -1)
      userAliases[user.login] = true
    npmPackages = data.npmPackagesData.filter(function (n) {
      return n.maintainers.some(function (m) {
        return m.toLowerCase() in userAliases
      })
    })

    if (!npmPackages.length)
      return

    // final data for the view
    auUsers.push({
        user     : user.login
      , user_lc  : login
      , name     : user.name
      , location : user.location
      , blog     : user.blog ? (/http/i).test(user.blog) ? user.blog : 'http://' + user.blog : ''
      , avatar   : user.avatar_url
      , email    : user.email
      , company  : user.company
      , hireable : user.hireable
      , github   : user.html_url
      , packages : npmPackages
      , fetched  : new Date()
    })

  })

  // sort by number of packages, got a better idea?
  auUsers.sort(function (u1, u2) {
    return u2.packages.length - u1.packages.length
  })

  callback(null, auUsers)
}

function fetch (callback) {
  async.parallel({
      auGithubData    : fetchData(AU_GITHUB_USERS_DATA_URL)
    , npmPackagesData : fetchData(ALL_NPM_PACKAGES_DATA_URL)
  }, function (err, data) {
    if (err)
      return callback(err)
    processData(data, callback)
  })
}

module.exports = fetch
module.exports.__meta__ = {
    id: 'githubDataFetcher'
}