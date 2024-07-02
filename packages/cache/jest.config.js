/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	globals: { "ts-jest": { tsconfig: "tsconfig.json" } },
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	transform: { "^.+\\.ts?$": "ts-jest" },
	testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
	coverageDirectory: "coverage",
	coverageReporters: ["html", "text", "lcov", "json-summary"],
};
