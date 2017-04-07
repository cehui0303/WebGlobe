var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');

var ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
var extractPlugin = new ExtractTextWebpackPlugin("bundle.[contenthash].css");

var WebpackMd5Hash = require('webpack-md5-hash');
var webpackMd5HashPlugin = new WebpackMd5Hash();

var HtmlWebpackPlugin = require('html-webpack-plugin');
var htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './index.html',
    // template: '!!ejs!./template.html',
    hash: false,
    inject: 'body'
});

var buildFolder = "buildOutput";

var PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
    entry: path.resolve(__dirname, "./src/webapp/index.jsx"),

    output: {
        path: path.resolve(__dirname, buildFolder),
        filename: "bundle.[chunkhash].js",
        // publicPath: buildFolder + "/",
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".scss", ".png"]
    },

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.jsx?$/, loader: "babel-loader" },
            { test: /\.scss$/, loader: extractPlugin.extract("css?modules&localIdentName=[name]__[local]___[hash:base64:5]!sass") },
            { test: /\.(png|jpeg|jpg)$/, loader: "file-loader" },
            { test: /\.(otf|ttf|eot|woff|woff2)\?v=.*/, loader: "file-loader" }
        ]
    },

    plugins: [
        extractPlugin,
        webpackMd5HashPlugin,
        htmlWebpackPlugin
    ],

    // devtool: PRODUCTION ? 'hidden-source-map' : 'cheap-module-eval-source-map'
    devtool: PRODUCTION ? false : 'source-map'
};

if (process.argv.indexOf("--ci") >= 0) {
    //https://github.com/webpack/webpack/issues/708
    module.exports.plugins.push(
        function() {
            this.plugin("done", function(stats) {
                var errors = stats.compilation.errors;
                if (errors && errors.length > 0) {
                    console.log("");
                    console.log(chalk.red("----------------------------------------------------------------"));
                    errors.forEach(function(err) {
                        var msg = chalk.red(`ERROR in ${err.module.userRequest},`);
                        msg += chalk.blue(`(${err.location.line},${err.location.character}),`);
                        msg += chalk.red(err.rawMessage);
                        console.log(msg);
                    });
                    console.log(chalk.red("----------------------------------------------------------------"));
                    process.exit(1);
                }
            });
        }
    );
}

if (PRODUCTION) {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: false
    }));
}