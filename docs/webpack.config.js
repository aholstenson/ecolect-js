const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';

const browsers = [
	// Desktop browsers
	'last 2 Chrome versions',
    'last 2 Edge versions',
    'last 2 Firefox versions',
	'last 2 Safari versions',

	// Mobile browsers
    'last 2 iOS versions',
    'ChromeAndroid >= 56' /* latest WebView */
];

const postcss = [
	{
		loader: 'css-loader',
		options: { sourceMap: true, importLoaders: 1 },
	},
	{
		loader: 'postcss-loader',
		options: {
			sourceMap: true,
			plugins: (loader) => {
				const result = [
					require('postcss-import')({
						root: loader.resourcePath,
						addDependencyTo: loader
					}),
					require('postcss-nested')(),
					require('postcss-preset-env')({
						stage: 1,
						browsers
					})
				]

				if(! isDevelopment) {
					result.push(require('postcss-clean')())
				}

				return result;
			}
		}
	}
];

module.exports = {
	mode: isDevelopment ? 'development' : 'production',

    entry: {
        main: './assets/js/main.js',
    },

    output: {
		publicPath: '/assets/',

		filename: '[name].js',
		chunkFilename: '[name].[chunkhash].js',

        path: path.resolve(__dirname, 'build/assets/')
    },

	devtool: isDevelopment ? 'inline-source-map' : false,

	resolve: {
		symlinks: false,

		modules: [
			path.resolve(__dirname, 'node_modules'),
			'node_modules'
		]
	},

	node: {
		console: false,
		Buffer: false
	},

	module: {
		rules: [
			{
    			test: /\.css$/,
				use: [
					'css-hot-loader',
					MiniCssExtractPlugin.loader
				].concat(postcss)
			},
			{
				test: /\.js$/,
                exclude: /node_modules\/(?!(ecolect|date-fns)).*/,
				use: {
					loader: 'babel-loader',
					options: {
						sourceType: 'unambiguous',
						presets: [
							[ '@babel/preset-env', {
								targets: { browsers }
							} ],
							'@babel/preset-react'
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-syntax-dynamic-import'
						]
					}
				}
			}
		]
	},

	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CopyWebpackPlugin([
			{
				from: 'content/images',
				to: '../images',
				toType: 'dir'
			}
		])
	],

	devServer: {
		contentBase: path.resolve(__dirname, 'build'),
		hot: true,
		watchContentBase: true
	}
};

module.exports.plugins.push(new MiniCssExtractPlugin({
	filename: "[name].css",
	chunkFilename: "[id].css"
}));

if(! isDevelopment) {
	module.exports.plugins.push(new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify('production')
		}
	}));
	module.exports.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
} else {
	module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
}
