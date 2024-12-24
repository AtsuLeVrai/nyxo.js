import type {
  ApiVersion,
  ApplicationEntity,
  Integer,
  UnavailableGuildEntity,
  UserEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export interface ReadyEntity {
  v: ApiVersion;
  user: UserEntity;
  guilds: UnavailableGuildEntity[];
  session_id: string;
  resume_gateway_url: string;
  shard?: [shardId: Integer, numShards: Integer];
  application: Pick<ApplicationEntity, "id" | "flags">;
}
