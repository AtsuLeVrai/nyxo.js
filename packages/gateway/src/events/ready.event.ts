import {
  ApiVersion,
  ApplicationSchema,
  UnavailableGuildSchema,
  UserSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export const ReadySchema = z.object({
  v: z.nativeEnum(ApiVersion).default(ApiVersion.v10),
  user: UserSchema,
  guilds: z.array(UnavailableGuildSchema),
  session_id: z.string(),
  resume_gateway_url: z.string(),
  shard: z.tuple([z.number().int(), z.number().int()]),
  application: ApplicationSchema.pick({ id: true, flags: true }),
});

export type ReadyEntity = z.infer<typeof ReadySchema>;
