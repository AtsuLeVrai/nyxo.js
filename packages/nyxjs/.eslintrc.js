/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
    extends: "../../configs/eslint/node.js",
    rules: {
        "id-length": "off",
        "n/no-sync": "warn",
    },
};
