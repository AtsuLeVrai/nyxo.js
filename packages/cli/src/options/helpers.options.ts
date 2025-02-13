import { deepmerge } from "deepmerge-ts";
import type { NyxJsOptions } from "./types.options.js";

export const DEFAULT_CONFIG: NyxJsOptions = {
  paths: {
    outDir: "dist",
    srcDir: "src",
    commandsDir: ["src/commands"],
    eventsDir: ["src/events"],
    customDir: ["src/custom"],
    assets: ["src/assets"],
    public: "public",
    cache: ".nyxjs",
  },
  build: {
    swc: {
      jsc: {
        target: "esnext",
        parser: {
          syntax: "typescript",
          tsx: false,
          decorators: true,
        },
        externalHelpers: true,
        keepClassNames: true,
        transform: {
          legacyDecorator: false,
          decoratorMetadata: true,
          useDefineForClassFields: true,
        },
      },
      module: {
        type: "es6",
        strict: true,
        lazy: true,
        importInterop: "swc",
      },
      sourceMaps: false,
      exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
      minify: false,
    },
    clean: true,
  },
  dev: {
    paths: ["src"],
    ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
  },
  plugins: [],
};

export function defineConfig(config: Partial<NyxJsOptions> = {}): NyxJsOptions {
  return deepmerge(DEFAULT_CONFIG, config);
}
