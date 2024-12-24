import type { Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export interface RequestGuildMembersEntity {
  guild_id: Snowflake;
  query?: string;
  limit: Integer;
  presences?: boolean;
  user_ids?: Snowflake | Snowflake[];
  nonce?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export interface RequestSoundboardSoundsEntity {
  guild_ids: Snowflake[];
}
