const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
	entry: './src/main.js',
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		},
		extensions: ['*', '.js', '.vue', '.json']
	},
	module: {
		rules: [
			{ test: /\.js$/, use: 'babel-loader' },
			{ test: /\.vue$/, use: 'vue-loader' },
			{ test: /\.css$/, use: ['vue-style-loader', 'css-loader']},
		]
	},
	devServer: {
		open: false,
		hot: true,
		host: '0.0.0.0',
		port: 1234,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			favicon: './static/favicon.ico',
		}),
		new VueLoaderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
};
