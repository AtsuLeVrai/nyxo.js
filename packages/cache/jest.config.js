/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
	moduleFileExtensions: ["ts", "js", "json", "node"],
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
};
