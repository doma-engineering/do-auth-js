# doauthor-js

A browser client for DoAuth.

For usage as a library, consult `embedded_test_suite.html`.

## Adding to your website

Use unpkg.com! More instructions pending.

## Development environment

*Disclaimer*:

Currently we only support Ubuntu LTS, which we run on all the developer machines and all the production servers.
It's trivial to use our source codes on other distros, but we don't support it, although we welcome external packaging efforts.

Run `npm run bootstrap`, which shall install `google-chrome-stable`, download `sodium` and install pre-commit hooks.

If you already have `google-chrome-stable`, run `npm run get:hooks && npm run get:sodium`, or don't worry about it and just reinstall it.

Now you can run `npm run watch` and hack on `src/doauthor.js`.

## Testing

Run `npm run test:setup` in a terminal. It will serve `embedded_test_suite.html` so that `wdio` can run and test it.

Now run `npm run test:run` to perform the actual tests.
