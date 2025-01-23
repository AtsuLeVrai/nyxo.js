import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX =
  /^DiscordBot \(([^,\s]+), (\d+(\.\d+)*)\)$/;

export const HttpOptions = z.object({
  token: z.string(),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
  timeout: z.number().int().default(15000),
});
