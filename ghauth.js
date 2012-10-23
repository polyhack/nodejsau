var read    = require('read')
  , colors  = require('colors')
  , request = require('request')
  , GITHUB_AUTHORIZATION_URL = 'https://api.github.com/authorizations'

  , auth = function (config, callback) {
      console.log('To collect GitHub stats we need you to authenticate so we can exceed API rate-limiting.'.bold.green)
      console.log('Leave the username field blank to skip stats collection.'.bold.green)
      console.log()

      read({ prompt: 'GitHub username:'.bold }, function (err, data) {
        if (err) return callback(err)
        if (data === '') return callback()
        config.ghUser = data
        read({ prompt: 'GitHub password:'.bold, silent: true, replace: '\u2714' }, function (err, data) {
          if (err) return callback(err)
          config.ghPass = data
          callback()
        })
      })
    }

  , createBasic = function (user, pass) {
      return "Basic " + new Buffer(user + ":" + pass).toString('base64')
    }

  , createAuth = function (user, pass, note, callback) {
      var opts = {
              url     : GITHUB_AUTHORIZATION_URL
            , method  : 'POST'
            , headers : { Authorization: createBasic(user, pass) }
            , body    : { note: note }
            , json    : true
          }
        , handle = function (err, response, body) {
            if (err) return callback('Error: ' + err)
            callback(null, body)
          }
      request(opts, handle)
    }

module.exports = auth
module.exports.createAuth = createAuth
module.exports.createBasic = createBasic