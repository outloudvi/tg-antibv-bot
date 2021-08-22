const path = require('path')

module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: {
    main: './src/index.ts',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'worker.js',
  },
  performance: {
    hints: false,
  },
}
