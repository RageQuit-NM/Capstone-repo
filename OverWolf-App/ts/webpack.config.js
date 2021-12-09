const
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CopyPlugin = require("copy-webpack-plugin"),
    { CleanWebpackPlugin } = require('clean-webpack-plugin'),
    OverwolfPlugin = require('./overwolf.webpack');

module.exports = env => ({
    entry: {
        background: './src/background/background.ts',
        launcher: './src/launcher/launcher.ts',
        in_game: './src/in_game/in_game.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'js/[name].js'
    },
    plugins: [
        new CleanWebpackPlugin,
        new CopyPlugin({
            patterns: [ { from: "public", to: "./" } ],
        }),
        new HtmlWebpackPlugin({
            template: './src/background/background.html',
            filename: path.resolve(__dirname, './dist/background.html'),
            chunks: ['background']
        }),
        new HtmlWebpackPlugin({
            template: './src/launcher/launcher.html',
            filename: path.resolve(__dirname, './dist/launcher.html'),
            chunks: ['launcher']
        }),
        new HtmlWebpackPlugin({
            template: './src/in_game/in_game.html',
            filename: path.resolve(__dirname, './dist/in_game.html'),
            chunks: ['in_game']
        }),
        new OverwolfPlugin(env)
    ]
})
