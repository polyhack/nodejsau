module.exports = {
    ignoreUsers      : require('../ignoreusers.json')
  , twitterMapping   : require('../twittermapping.json')
  , npmGithubMapping : require('../npmgithubmapping.json')
  , companies        : require('../companies.json')
  , meetups          : require('../meetups.json')
  , isDev            : (/^dev/i).test(process.env.NODE_ENV)
}
