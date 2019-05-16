const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
    devtool: 'source-map',
    optimization: {
        minimizer: [new TerserPlugin({
            sourceMap: true,
            cache: true
        }), new OptimizeCSSAssetsPlugin({})]
    }
});