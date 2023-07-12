const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	mode: 'development',
	entry: './src/scripts/index.js',
	output: {
		filename: 'scripts/[name].[contenthash].js',
		path: path.resolve(__dirname, 'build'),
		publicPath: '',
		clean: true,
		assetModuleFilename: 'assets/images/[name].[contenthash][ext]',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
				exclude: /node_modules/,
			},
			{ test: /\.(js)$/, use: 'babel-loader' },
			{
				test: /\.svg$/,
				type: 'asset/resource',
				generator: {
					filename: 'assets/icons/[name][ext]',
				},
			},
			{
				test: /\.(png|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'src', 'templates', 'index.html'),
			filename: 'templates/[name].[contenthash].html',
			publicPath: '../',
		}),
		new webpack.ProgressPlugin(),
		new MiniCssExtractPlugin({
			filename: 'assets/styles/[name].[contenthash].css',
		}),
		new CopyWebpackPlugin({
			patterns: [{ from: 'src/assets/icons', to: 'assets/icons' }],
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'build'),
		},
		compress: true,
		port: 9000
	},
}
