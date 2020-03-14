module.exports = {
	'root': true,
	'env': {
		'node': true,
		'browser': true,
		'es6': true
	},
	'extends': [
		'airbnb-base',
	],
	'parserOptions': {
		'parser': 'babel-eslint'
	},
	'rules': {
		'generator-star-spacing': 'off',
		'no-mixed-operators': 0,
		'no-console': 0,
		'indent': [
			'error',
			'tab'
		],
		quotes: 'off',
		'linebreak-style': ['error', 'windows']
	}
}
