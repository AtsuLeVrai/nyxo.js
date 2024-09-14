import type { GuildTemplateStructure, Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { Guild } from "./Guilds";
import { User } from "./Users";

export class GuildTemplate extends Base<GuildTemplateStructure> {
    public code!: string;

    public createdAt!: IsoO8601Timestamp;

    public creator!: User;

    public creatorId!: Snowflake;

    public description!: string | null;

    public isDirty!: boolean | null;

    public name!: string;

    public serializedSourceGuild!: Pick<
        Guild,
        | "afkChannelId"
        | "afkTimeout"
        | "defaultMessageNotifications"
        | "description"
        | "explicitContentFilter"
        | "iconHash"
        | "name"
        | "preferredLocale"
        | "region"
        | "roles"
        | "systemChannelFlags"
        | "systemChannelId"
        | "toJSON"
        | "verificationLevel"
    >;

    public sourceGuildId!: Snowflake;

    public updatedAt!: IsoO8601Timestamp;

    public usageCount!: Integer;

    public constructor(data: Readonly<Partial<GuildTemplateStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildTemplateStructure>>): void {
        if (data.code !== undefined) {
            this.code = data.code;
        }

        if (data.created_at !== undefined) {
            this.createdAt = data.created_at;
        }

        if (data.creator !== undefined) {
            this.creator = User.from(data.creator);
        }

        if (data.creator_id !== undefined) {
            this.creatorId = data.creator_id;
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.is_dirty !== undefined) {
            this.isDirty = data.is_dirty;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.serialized_source_guild !== undefined) {
            this.serializedSourceGuild = Guild.from(data.serialized_source_guild);
        }

        if (data.source_guild_id !== undefined) {
            this.sourceGuildId = data.source_guild_id;
        }

        if (data.updated_at !== undefined) {
            this.updatedAt = data.updated_at;
        }

        if (data.usage_count !== undefined) {
            this.usageCount = data.usage_count;
        }
    }
}
