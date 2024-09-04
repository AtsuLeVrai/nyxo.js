const process = require("node:process");
const path = require("node:path");

const tsconfig = path.resolve(process.cwd(), "tsconfig.eslint.json");

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    root: true,
    extends: ["neon/common", "neon/node", "neon/typescript", "neon/prettier"],
    parserOptions: {
        project: tsconfig
    },
    ignorePatterns: ["**/dist/*"]
}