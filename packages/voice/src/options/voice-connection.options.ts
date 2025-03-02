import { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { VoiceGatewayVersion } from "../types/index.js";
import { IpDiscoveryOptions } from "./ip-discovery.options.js";
import { AudioOptions } from "./voice-audio.options.js";

export const VoiceConnectionOptions = z
  .object({
    endpoint: z.string(),
    token: z.string(),
    sessionId: z.string(),
    guildId: Snowflake,
    userId: Snowflake,
    version: z.nativeEnum(VoiceGatewayVersion).default(VoiceGatewayVersion.V8),
    ipDiscovery: IpDiscoveryOptions.default({}),
    audioOptions: AudioOptions.default({}),
  })
  .readonly();

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;
