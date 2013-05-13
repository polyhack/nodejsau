const FETCH_FREQUENCY = 1000 * 60 * 60 * 12 // twice a day

    , npmMaintainers  = require('npm-maintainers-au')

var config = {
        id      : 'auUserData'
      , type    : 'factory'
    }

    // cached here
  , userData = null

// fetch the data
function updateData () {
  npmMaintainers(function (err, data) {
    if (err) return console.error(err)
    userData = data
  })
}

function auUserData () {
  setInterval(updateData, FETCH_FREQUENCY)
  updateData()

  return function () {
    return userData
  }
}

module.exports          = auUserData
module.exports.__meta__ = config