const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = {
  entry: {
    app: './src/app.js',
  },
  output: {
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '*'],
    modules: ['node_modules'],
  },
  bail: true,
  mode: 'production',
  target: 'node',
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'data.txt', to: 'data.txt' },
        { from: 'readme.md', to: 'readme.md' },
      ]
    })
  ]
};

module.exports = config;
