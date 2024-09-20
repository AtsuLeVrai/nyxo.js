import { common, prettier, typescript } from "eslint-config-neon";
import merge from "lodash.merge";
import path from "node:path";
import process from "node:process";

const tsconfig = path.resolve(process.cwd(), "tsconfig.eslint.json");

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
  ...[...common, ...typescript, ...prettier].map((config) =>
    merge(config, {
      files: ["src/**/*.ts"],
      languageOptions: {
        parserOptions: {
          project: tsconfig,
        },
      },
    }),
  ),
];

export default config;
