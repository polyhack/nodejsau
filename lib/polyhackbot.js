const polyhackbot = require('polyhackbot')
    , version  = require('../package').version

var bot

module.exports = function () {
  if (bot)
    return bot

  if (process.env.NTWITTER && process.env.FREENODE_PASS) {
    return bot = polyhackbot(

        {
            'ntwitter': JSON.parse(process.env.NTWITTER)
          , 'ircPassword': process.env.FREENODE_PASS
        }

      , 'nodejsau@' + version
    )
  } else
    console.log('Not starting Polyhackbot')
}