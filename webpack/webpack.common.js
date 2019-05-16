const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const libPath = path.join(__dirname, 'entry');
const extensionPath = path.join(__dirname, '../extension');
const assetsFolder = 'assets/';
const outputPath = path.join(extensionPath, assetsFolder);

module.exports = {
    entry: {
        browser_action: path.join(libPath, 'browser_action.js'),
        background: path.join(libPath, 'background.js')
    },
    output: {
        path: outputPath,
        filename: '[name].js',
        publicPath: assetsFolder
    },
    module: {
        rules: [
            { test: /\.(gif|png|jpg|svg|cur)$/, loader: 'file-loader?name=img/[name].[ext]' },
            { test: /\.css$/, use: [{ loader: "style-loader" }, { loader: "css-loader" }] },
            { test: /\.scss$/, use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }] },
            { test: /\.js$/, exclude: /(node_modules)/, loader: "babel-loader", query: { presets: ["@babel/preset-env"] } },
            { test: /\.(eot|woff|ttf|woff2)/, loader: 'file-loader?name=fonts/[name].[ext]' },
            { test: /jquery\.js$/, loader: 'expose-loader?jQuery!expose-loader?$' },
            { test: /popper\.js$/, loader: 'expose-loader?Popper' },
            { test: /bootstrap\.js$/, loader: 'expose-loader?Bootstrap' },
            { test: /pouchdb\.js$/, loader: 'expose-loader?PouchDB' }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.join(extensionPath, 'popup.html'),
            template: path.join(libPath, 'popup.tpl'),
            inject: false
        }),
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
