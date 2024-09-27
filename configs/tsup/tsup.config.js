const tsup = require("tsup");

/**
 * Create tsup config
 *
 * @param {string[]} entry
 * @param {tsup.Options} [options={}]
 * @returns {tsup.Options | tsup.Options[] | ((overrideOptions: tsup.Options) => MaybePromise<tsup.Options | tsup.Options[]>)}
 */
function createTsupConfig(entry, options = {}) {
  return tsup.defineConfig({
    splitting: false,
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    legacyOutput: true,
    minify: false,
    tsconfig: "tsconfig.json",
    entry: entry,
    format: ["cjs", "esm"],
    target: "esnext",
    terserOptions: {
      ecma: 2020,
      module: true,
      compress: {
        ecma: 2020,
        module: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.warn",
        ],
        dead_code: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        keep_fargs: false,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        side_effects: true,
        passes: 2,
      },
      mangle: true,
      toplevel: true,
      keep_classnames: false,
      keep_fnames: false,
    },
    experimentalDts: {
      entry: entry,
    },
    ...options,
  });
}

module.exports.createTsupConfig = createTsupConfig;
