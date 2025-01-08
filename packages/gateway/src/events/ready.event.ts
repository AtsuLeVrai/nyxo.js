import {
  ApiVersion,
  ApplicationEntity,
  UnavailableGuildEntity,
  UserEntity,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export const ReadyEntity = z.object({
  v: z.nativeEnum(ApiVersion).default(ApiVersion.V10),
  user: UserEntity,
  guilds: z.array(UnavailableGuildEntity),
  session_id: z.string(),
  resume_gateway_url: z.string(),
  shard: z.tuple([z.number().int(), z.number().int()]),
  application: ApplicationEntity.pick({ id: true, flags: true }),
});

export type ReadyEntity = z.infer<typeof ReadyEntity>;
