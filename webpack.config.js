'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/client/mainScreen.tsx',

    output: {
        path: path.resolve(__dirname, 'public/dist/client'),
        publicPath: '/public/dist/client',
        filename: 'project.bundle.js'
    },

    module: {
        rules: [
            {
                test: [/\.tsx?$/],
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    'ts-loader'
                ]
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.js','.tsx']
    },

    externals: {
        createjs: 'createjs'
    }

};
