/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	extends: "../../configs/eslint/node.js",
	rules: {
		"n/no-sync": "warn",
		"id-length": "off",
	},
};
