import { cosmiconfig } from "cosmiconfig";
import type { NyxJsOptions } from "../options/index.js";

const explorer = cosmiconfig("nyxjs");

export async function loadConfig(): Promise<NyxJsOptions> {
  const result = await explorer.search();
  if (!result) {
    throw new Error("Config file not found");
  }

  return result.config;
}
