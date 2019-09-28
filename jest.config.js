module.exports = {
	transform: {
		".(ts|tsx)": "ts-jest"
	},
	"testEnvironment": "node",
	"testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$",
	"moduleFileExtensions": [
		"ts",
		"tsx",
		"js"
	],
	"coveragePathIgnorePatterns": [
		"/node_modules/",
		"/test/"
	],
	"collectCoverageFrom": [
		"src/**/*.{js,ts}"
	],
	globals: {
		"ts-jest": {
			"diagnostics": {
				"ignoreCodes": "TS2531"
			}
		}
	}
}
