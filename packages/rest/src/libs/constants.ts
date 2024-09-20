import { ApiVersions } from "@nyxjs/core";
import type { RestOptions } from "../types";

export const DISCORD_API_URL = "https://discord.com/api";

export const REST_DEFAULT_OPTIONS: RestOptions = {
    version: ApiVersions.V10,
};
