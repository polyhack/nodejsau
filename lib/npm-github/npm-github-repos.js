      // if your GitHub location field matches this then we'll guess you're Aussie
const GITHUB_REPO_REGEX = /github.com[:\/]([\.\-\w]+)\/([^$\/\.]+)/

var npm = require('npm')

    // load the list of all npm libs with 'repo' pointing to GitHub
module.exports = function (callback) {
      var repos   = []
        , npmData = []

      npm.load(function () {
        npm.registry.get('/-/all', function (err, data) {
          Object.keys(data).forEach(function (k) {
            if (data[k].maintainers) {
              npmData.push({
                  name        : data[k].name
                , owners      : data[k].maintainers.map(function (m) { return m.name.toLowerCase() })
                , description : data[k].description
              })
            } else
              console.log('no maintainers for', k)
            var match = data[k].repository
                && typeof data[k].repository.url == 'string'
                && data[k].repository.url.match(GITHUB_REPO_REGEX)
            if (match) {
              repos.push({ user: match[1], repo: match[2] })
            }
          })
          callback(null, repos, npmData)
        })
      })
    }