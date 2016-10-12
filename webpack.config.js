/* eslint-env node */
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';

module.exports = {
    entry: [
        './src/index.jsx'
    ],
    output: {
        path: __dirname + '/public',
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ],
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react']
            }
        },
        {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('css!sass')
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(env)
            }
        }),
        new ExtractTextPlugin('style.css', {
            allChunks: true
        })
    ],
    devtool: env === 'development' ? 'source-map' : undefined
};
