const path = require('path');

module.exports = (env) => {
  return {
    mode: env.development ? 'development' : 'production',
    entry: './src/doauthor.js',
    output: {
      filename: 'doauthor.js',
      library: 'DoAuthor',
      path: path.resolve(__dirname, 'dist')
    },
  }
};
