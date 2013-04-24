const bot = require('./polyhackbot')()

    , FETCH_FREQUENCY = 1000 * 60 * 60 * 24 * 2 // once every 2 days

var config = {
        id      : 'auUserData'
      , type    : 'factory'
      , depends : [ 'githubDataFetcher' ]
    }

  , userData = null

  , updateData = function (githubDataFetcher) {
      githubDataFetcher(function (err, data) {
        if (err) {
          console.error('Error fetching npm & GitHub data:', err)
          console.error(err.stack)
          return
        }
        userData = data
        bot.setMaintainers(data.map(function (u) { return u.user }))
      })
    }

var auUserDataFetcher = function () {
      setInterval(updateData.bind(null, this.githubDataFetcher), FETCH_FREQUENCY)
      updateData(this.githubDataFetcher)
      return function () {
        return userData
      }
    }

module.exports = auUserDataFetcher
module.exports.__meta__ = config