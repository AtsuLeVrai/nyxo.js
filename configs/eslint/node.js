const process = require("node:process");
const path = require("path");

const tsconfig = path.resolve(process.cwd(), "tsconfig.json");

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    root: true,
    extends: ["neon/common", "neon/node", "neon/typescript"],
    parserOptions: {
        project: tsconfig
    },
    ignorePatterns: ["**/dist/*"]
}
