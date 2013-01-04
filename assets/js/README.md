You'll need Ender installed for this, use the 1.0 pre-release version:

```sh
$ npm install ender@dev -g
```

Then when you edit *app.js* run:

```sh
ender build . -o nodejsau.js
```

Or alternatively you could include *app.js* in a &lt;script&gt; or edit
nodejsau.js manually but make sure you commit changes to app.js when
you'er done. Whatever.
