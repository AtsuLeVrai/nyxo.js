import {common, typescript} from "eslint-config-neon";
import merge from "lodash.merge";
import {resolve} from "node:path";
import process from "node:process";

const tsconfig = resolve(process.cwd(), "tsconfig.eslint.json");

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export const NodeEslintConfig = [
    ...[...common, ...typescript].map((config) =>
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
