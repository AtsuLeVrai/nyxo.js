import type {
  ApplicationEntity,
  Integer,
  InviteTargetType,
  Iso8601,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export interface InviteDeleteEntity {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  code: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export interface InviteCreateEntity {
  channel_id: Snowflake;
  code: string;
  created_at: Iso8601;
  guild_id?: Snowflake;
  inviter?: UserEntity;
  max_age: Integer;
  max_uses: Integer;
  target_type?: InviteTargetType;
  target_user?: UserEntity;
  target_application?: Partial<ApplicationEntity>;
  temporary: boolean;
  uses: Integer;
}
