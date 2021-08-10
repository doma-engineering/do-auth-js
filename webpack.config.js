const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/doauth_client.js',
  output: {
    filename: 'doauth.js',
    library: 'DoAuthJs',
    path: path.resolve(__dirname, 'dist')
  },
};
