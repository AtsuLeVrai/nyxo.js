import type { GuildScheduledEventEntity, Snowflake } from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-query-string-params}
 */
export interface GetEventsQueryEntity {
  with_user_count?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export interface GetUsersQueryEntity {
  limit?: number;
  with_member?: boolean;
  before?: Snowflake;
  after?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export interface CreateEventEntity
  extends Pick<
    GuildScheduledEventEntity,
    | "channel_id"
    | "entity_metadata"
    | "name"
    | "privacy_level"
    | "scheduled_start_time"
    | "scheduled_end_time"
    | "description"
    | "entity_type"
    | "recurrence_rule"
  > {
  image?: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export type ModifyEventEntity = Partial<CreateEventEntity>;
