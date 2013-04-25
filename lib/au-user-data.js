const bot = require('./polyhackbot')()

const FETCH_FREQUENCY = 1000 * 60 * 60 * 24 * 1 // once a day

var config = {
        id      : 'auUserData'
      , type    : 'factory'
      , depends : [ 'githubDataFetcher' ]
    }

  , userData = null

function updateData (githubDataFetcher) {
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

function auUserDataFetcher () {
  setInterval(updateData.bind(null, this.githubDataFetcher), FETCH_FREQUENCY)
  updateData(this.githubDataFetcher)
  return function () {
    return userData
  }
}

module.exports = auUserDataFetcher
module.exports.__meta__ = config