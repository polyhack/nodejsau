const FETCH_FREQUENCY = 1000 * 60 * 60 * 12 // twice a day
    , npmMaintainers  = require('npm-maintainers-au')

// cached here
var userData = null

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

module.exports = auUserData