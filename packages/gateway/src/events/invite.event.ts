import type {
  ApplicationEntity,
  InviteTargetType,
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
  created_at: string;
  guild_id?: Snowflake;
  inviter?: UserEntity;
  max_age: number;
  max_uses: number;
  target_type?: InviteTargetType;
  target_user?: UserEntity;
  target_application?: Partial<ApplicationEntity>;
  temporary: boolean;
  uses: number;
}
