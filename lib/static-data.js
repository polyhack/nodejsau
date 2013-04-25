module.exports = {
    ignoreUsers      : require('../ignoreusers')
  , twitterMapping   : require('../twittermapping')
  , npmGithubMapping : require('../npmgithubmapping')
  , isDev            : (/^dev/i).test(process.env.NODE_ENV)
}