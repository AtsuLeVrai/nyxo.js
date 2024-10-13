const process = require("node:process");
const path = require("node:path");

const tsconfig = path.resolve(process.cwd(), "tsconfig.json");

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    "neon/common",
    "neon/browser",
    "neon/node",
    "neon/typescript",
    "neon/react",
    "neon/next",
    "neon/edge",
    "neon/prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    project: tsconfig,
  },
  ignorePatterns: ["**/dist/*"],
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
  },
};
