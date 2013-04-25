const AU_GITHUB_USERS_DATA_URL  = 'https://raw.github.com/polyhack/npm-github-data/master/githubusers_au.json'
    , ALL_NPM_PACKAGES_DATA_URL = 'https://raw.github.com/polyhack/npm-github-data/master/allpackages.json'

const request          = require('request')
    , async            = require('async')
    , ignoreUsers      = require('./static-data').ignoreUsers
    , npmGithubMapping = require('./static-data').npmGithubMapping

// download the latest data from github
function fetchData (url) {
  return function (callback) {
    if (url == AU_GITHUB_USERS_DATA_URL)
      return callback(null, require('/home/rvagg/git/npm-github-data/githubusers_au'))
    else
      return callback(null, require('/home/rvagg/git/npm-github-data/allpackages.json'))

    request({ url: url, json: true, method: 'get'}, function (err, response, body) {
      if (err)
        return callback(err)

      return callback(null, body)
    })
  }
}

function processData (data, callback) {
  var auUsers  = []
    , aliases  = {}
    , npmUsers = {}

  // collect aliases to map github user accounts to npm maintainer accounts
  // but this is a rough science since maintainership can be switched around in npm
  data.npmPackagesData.forEach(function (n) {
    if (!n.githubUser) // || n.maintainers.length > 1)
      return

    var ghuser = n.githubUser.toLowerCase()

    if (!aliases[ghuser])
      aliases[ghuser] = {}

    n.maintainers.forEach(function (maintainer) {
      var m = maintainer.toLowerCase()

      npmUsers[m] = maintainer

      if (ignoreUsers.indexOf(m) == -1)
        aliases[ghuser][m] = (aliases[ghuser][m] || 0) + 1
    })
  })

  // now we do a reverse map against the npm data and find all the packages that
  // have an au user as a maintainer (or their alias)
  data.auGithubData.forEach(function (user) {
    var login        = user.login.toLowerCase()
      , userAliases  = aliases[login] || {}
      , aliasesArray = Object.keys(userAliases)
      , npmPackages
      , npmLogin

    if (ignoreUsers.indexOf(login) > -1)
      return

    if (auUsers.some(function (u) { return login == u.user_lc }))
      return // dupe, how?

    npmLogin = aliasesArray.length == 1
      ? aliasesArray[0]
      : aliases[login][login]
        ? login
        : false

    if (!npmLogin)
      return console.log('Can\'t work out', login, 'from', aliases[login])

    // all packages for which this user is a maintainer
    npmPackages = data.npmPackagesData.filter(function (n) {
      return n.maintainers.some(function (m) {
        return m.toLowerCase() == npmLogin // npmLogin is still lower case here
      })
    })

    // no packages? no cake!
    if (!npmPackages.length)
      return

    // weird, shouldn't happen but just in case
    if (!npmUsers[npmLogin])
      console.log('Huh? Can\'t find', npmLogin)

    // final data for the view
    auUsers.push({
        githubLogin : user.login         // correct case
      , npmLogin    : npmUsers[npmLogin] // correct case
      , user_lc     : login
      , name        : user.name
      , location    : user.location
      , blog        : user.blog ? (/http/i).test(user.blog) ? user.blog : 'http://' + user.blog : ''
      , avatar      : user.avatar_url
      , email       : user.email
      , company     : user.company
      , hireable    : user.hireable
      , githubUrl   : user.html_url
      , packages    : npmPackages
      , fetched     : new Date()
    })

  })

  // find any duplicate npmLogin entries, they'll have different githubLogins
  // so we take a best guess and then an educated guess with npmGithubMappings.
  // the main effect here is to remove company entries that resolve to user
  // entries that already exist, such as siphon-io -> deoxxa
  auUsers = auUsers.filter(function (a1, i) {
    for (var j = 0, a2; j < auUsers.length; j++) {
      a2 = auUsers[j]
      if (i != j && a1.npmLogin == a2.npmLogin) {
        if (a1.npmLogin == a1.githubLogin || npmGithubMapping[a1.npmLogin] == a1.githubLogin) {
          // npmLogin is the same as GitHub, or we have a nexplicit override
          break
        } else {
          console.log('Rejecting duplicate npm login: (npm)', a1.npmLogin, '(github)', a1.githubLogin)
          return false
        }
      }
    }
    return true
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