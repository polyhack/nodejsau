module.exports = {
    ignoreUsers    : require('../ignoreusers')
  , twitterMapping : require('../twittermapping')
  , isDev          : (/^dev/i).test(process.env.NODE_ENV)
}