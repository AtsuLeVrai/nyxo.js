import type { Integer, Iso8601Timestamp, Snowflake } from "../libs/types";
import type { GuildStructure } from "./guilds";
import type { UserStructure } from "./users";

/**
 * Type representing the structure of a guild template.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object-guild-template-structure|Guild Template Structure}
 */
export type GuildTemplateStructure = {
    /**
     * The template code (unique ID).
     */
    code: string;
    /**
     * When this template was created.
     */
    created_at: Iso8601Timestamp;
    /**
     * The user who created the template.
     */
    creator: UserStructure;
    /**
     * The ID of the user who created the template.
     */
    creator_id: Snowflake;
    /**
     * The description for the template.
     */
    description: string | null;
    /**
     * Whether the template has unsynced changes.
     */
    is_dirty: boolean | null;
    /**
     * The template name.
     */
    name: string;
    /**
     * The guild snapshot this template contains.
     *
     * @todo This should have "channels" property.
     */
    serialized_source_guild: Pick<
        GuildStructure,
        | "afk_channel_id"
        | "afk_timeout"
        | "default_message_notifications"
        | "description"
        | "explicit_content_filter"
        | "icon_hash"
        | "name"
        | "preferred_locale"
        | "region"
        | "roles"
        | "system_channel_flags"
        | "system_channel_id"
        | "verification_level"
    >;
    /**
     * The ID of the guild this template is based on.
     */
    source_guild_id: Snowflake;
    /**
     * When this template was last synced to the source guild.
     */
    updated_at: Iso8601Timestamp;
    /**
     * Number of times this template has been used.
     */
    usage_count: Integer;
};
