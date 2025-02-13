import type { Config } from "@swc/core";

export interface BuildOptions {
  swc?: Config;
  clean?: boolean;
}

export interface DevOptions {
  paths?: string[];
  ignore?: string[];
}

export interface PathsOptions {
  outDir?: string;
  srcDir?: string;
  commandsDir?: string | string[];
  eventsDir?: string | string[];
  customDir?: string | string[];
  assets?: string | string[];
  public?: string;
  cache?: string;
}

export interface NyxJsOptions {
  paths?: PathsOptions;
  build?: BuildOptions;
  dev?: DevOptions | boolean;
  plugins?: string[];
}
