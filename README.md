# doauthor-js

A browser client for DoAuth.

For usage as a library, consult `embedded_test_suite.html`.

## Adding to your website

Fetch necessary stuff:

```
<script src="https://unpkg.com/doauthor@0.5.3/dist/doauthor.js"></script>
<script src="https://unpkg.com/doauthor@0.5.3/dist/sodium.js" async defer></script>
```

Then whenever you need access to `window.doauthor`, you'll have to first "require" DoAuthor like so:

```
await DoAuthor.require();
const u8a_ = doauthor.crypto.read('RmlyZSAvLyBJY2U=');
console.log(Array.from(u8a_).map((x) => String.fromCharCode(x)).join(''));
```

## Development environment

*Disclaimer*:

Currently we only support Ubuntu LTS, which we run on all the developer machines and all the production servers.
It's trivial to use our source codes on other distros, but we don't support it, although we welcome external packaging efforts.

Run `npm run bootstrap`, which shall install `google-chrome-stable`. Consider this version of chromium as unsafe to use for other things than testing and vulnerable, since it's an old version known to be compatible with wdio we use. Make sure to not forward none of the ports of the application to the external world. This script shall also download latest `sodium` and install pre-commit hooks.

If you already have `google-chrome-stable`, you'll have to first uninstall it (or upgrade dependencies to wdio and send us a pull request). Sorry.

Now you can run `npm run watch` and hack on `src/doauthor.js`.

## Testing

Make sure you have packed your code into `dist` by either having `npm run watch` on or `npm run build`.

Run `npm run test:setup` in a terminal. It will serve `embedded_test_suite.html` so that `wdio` can run and test it.

Now run `npm run build && npm run test:run` to perform the actual tests.
