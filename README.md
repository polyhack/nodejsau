# http://nodejsau.jit.su

Set up a dev environment, this will limit the number of calls to the GitHub API:

```sh
export NODE_ENV=dev
```

Then, if you haven't got a GitHub auth token handy, make a new one (you should keep it around for future use so you don't have to keep on making a new one):

```sh
curl -u 'username' -d '{}' https://api.github.com/authorizations
```

*See https://help.github.com/articles/creating-an-oauth-token-for-command-line-use for more info on this*


Extract the token from the line that has `"token": "..."` and then:

```sh
export GHTOKEN=token here
```

To get [Polyhackbot](https://github.com/polyhack/polyhackbot) working as well you'll need Twitter authentication tokens. See [NTwitter](https://github.com/AvianFlu/ntwitter/#setup-api) for details about the format this takes. You should set up your auth data in a JSON string with the 2 auth & 2 secret keys and put them into an environment variable:

```sh
export NTWITTER='{"consumer_key": "xxx", "consumer_secret": "yyy", "access_token_key": "aa", "access_token_secret": "bb"}'
export FREENODE_PASS=password # password to authenticate the bot with NickServ
```

You can find us on Freenode @ #polyhack if you have questions.