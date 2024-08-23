import {browser, common, edge, next, node, react, typescript} from "eslint-config-neon";
import merge from "lodash.merge";
import {resolve} from "node:path";
import process from "node:process";

const tsconfig = resolve(process.cwd(), "tsconfig.eslint.json");

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export const NextEslintConfig = [
    ...[...common, ...browser, ...node, ...typescript, ...react, ...next, ...edge].map((config) =>
        merge(config, {
            files: ["src/**/*.ts"],
            settings: {
                react: {
                    version: "detect",
                },
            },
            languageOptions: {
                parserOptions: {
                    project: tsconfig,
                },
            },
        }),
    ),
];