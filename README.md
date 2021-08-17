# doauthor-js

A browser client for DoAuth.

For usage as a library, consult `embedded_test_suite.html`.

## Adding to your website

Fetch JS synchronously from unpkg.com:

```
<script src="https://unpkg.com/doauthor@0.2.2/dist/doauthor.js"></script>
```

Defer loading of sodium.js it's an important work around the issue that this sodium wrapper [doesn't provide promise-based API](https://github.com/jedisct1/libsodium.js/issues/284) for loading:

```
<script src="https://unpkg.com/doauthor@0.2.2/dist/sodium.js"></script>
```

Then add the following async call after `</body>`:

```
(async () => {
    DoAuthorBootstrapper.main().then(
        () => {
            // You have access to doauthor here
        }
    )
})
```

The reason why you can't add it in `window.onload` is that we're using `sodium.js` underneath, which loads asynchronously and independently from `window`, calling its own `window.sodium.onload` hook.

If you want to check that `doauthor` is loaded, we're setting `window.__doauthorHasLoaded__` variable to `true` after sodium and doauthor are done with injecting their functions into the global namespace.

## Development environment

*Disclaimer*:

Currently we only support Ubuntu LTS, which we run on all the developer machines and all the production servers.
It's trivial to use our source codes on other distros, but we don't support it, although we welcome external packaging efforts.

Run `npm run bootstrap`, which shall install `google-chrome-stable`, download `sodium` and install pre-commit hooks.

If you already have `google-chrome-stable`, run `npm run get:hooks && npm run get:sodium`, or don't worry about it and just reinstall it.

Now you can run `npm run watch` and hack on `src/doauthor.js`.

## Testing

Make sure you have packed your code into `dist` by either having `npm run watch` on or `npm run build`.

Run `npm run test:setup` in a terminal. It will serve `embedded_test_suite.html` so that `wdio` can run and test it.

Now run `npm run test:run` to perform the actual tests.
