var polyhackbot = require('polyhackbot')
  , version  = require('../package').version

module.exports = function () {
  if (process.env.NTWITTER && process.env.FREENODE_PASS) {
    polyhackbot(

        {
            'ntwitter': JSON.parse(process.env.NTWITTER)
          , 'ircPassword': process.env.FREENODE_PASS
        }

      , 'nodejsau@' + version
    )
  } else
    console.log('Not starting Polyhackbot')
}