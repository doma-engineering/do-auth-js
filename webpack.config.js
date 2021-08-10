const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/doauthor.js',
  output: {
    filename: 'doauthor.js',
    library: 'DoAuthor',
    path: path.resolve(__dirname, 'dist')
  },
};
