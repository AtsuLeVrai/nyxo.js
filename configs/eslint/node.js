const path = require("node:path");
const process = require("node:process");

const tsconfig = path.resolve(process.cwd(), "tsconfig.eslint.json");

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    root: true,
    extends: ["neon/common", "neon/node", "neon/typescript"],
    parserOptions: {project: tsconfig},
    ignorePatterns: ["**/dist/*"],
};
