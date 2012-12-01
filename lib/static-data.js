if (!process.env.GHTOKEN)
  throw new Error('No GHTOKEN environment variable set')
module.exports = {
    githubToken    : process.env.GHTOKEN

  , ignoreUsers    : require('../ignoreusers')

  , twitterMapping : require('../twittermapping')

  , isDev          : (/^dev/i).test(process.env.NODE_ENV)
}