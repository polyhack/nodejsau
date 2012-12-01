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

Or, find us on Freenode @ #polyhack and ask!