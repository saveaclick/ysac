const webpack = require('webpack');
const path = require('path');
const nodeExternals = require("webpack-node-externals");
const slsw = require("serverless-webpack");

module.exports = {
  entry: {
    'index': path.join(__dirname, 'index.ts')
  },
  mode : slsw.lib.webpack.isLocal ? "development" : "production",
  // This OMITS any node modules from being added to the output file. We can add these into the package (as a separate folder)
  // using 'includeModules' in the serverless.yml config. This is important because we do NOT want to add aws-sdk
  // to the output, since AWS Lambda already has this library as part of the runtime environment.
  externals: [nodeExternals()],
  // Knex doesn't package well with webpack, so we need manually exclude some of the unnecessary db dependencies.
  // Knex doesn't package well with webpack, so we need manually exclude some of the unnecessary db dependencies.
  plugins: [
    new webpack.IgnorePlugin(/mariasql/, /\/knex\//),
    new webpack.IgnorePlugin(/mssql/, /\/knex\//),
    new webpack.IgnorePlugin(/mysql/, /\/knex\//),
    new webpack.IgnorePlugin(/mysql2/, /\/knex\//),
    new webpack.IgnorePlugin(/oracle/, /\/knex\//),
    new webpack.IgnorePlugin(/oracledb/, /\/knex\//),
    new webpack.IgnorePlugin(/pg-query-stream/, /\/knex\//),
    new webpack.IgnorePlugin(/sqlite3/, /\/knex\//),
    new webpack.IgnorePlugin(/strong-oracle/, /\/knex\//),
    new webpack.IgnorePlugin(/pg-native/, /\/pg\//)
  ],
  optimization: {
    minimize: 'production' === process.env.NODE_ENV
  },
  devtool: 'production' === process.env.NODE_ENV ? undefined : 'source-map',
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.json',
      '.less'
    ]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: path.join(__dirname, '.webpack')
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  },
};