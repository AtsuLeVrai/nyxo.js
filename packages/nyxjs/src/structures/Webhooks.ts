import type { WebhookStructure, WebhookTypes } from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { BaseChannel } from "./Channels";
import { Guild } from "./Guilds";
import { User } from "./Users";

export class Webhook extends Base<WebhookStructure> {
    public applicationId!: Snowflake | null;

    public avatar!: string | null;

    public channelId!: Snowflake | null;

    public guildId?: Snowflake;

    public id!: Snowflake;

    public name!: string | null;

    public sourceChannel?: Pick<BaseChannel, "id" | "name">;

    public sourceGuild?: Pick<Guild, "icon" | "id" | "name">;

    public token?: string;

    public type!: WebhookTypes;

    public url?: string;

    public user?: User;

    public constructor(data: Partial<WebhookStructure>) {
        super(data);
    }

    protected patch(data: Partial<WebhookStructure>): void {
        this.applicationId = data.application_id ?? this.applicationId;
        this.avatar = data.avatar ?? this.avatar;
        this.channelId = data.channel_id ?? this.channelId;

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;

        if ("source_channel" in data && data.source_channel) {
            this.sourceChannel = BaseChannel.from(data.source_channel);
        }

        if ("source_guild" in data && data.source_guild) {
            this.sourceGuild = Guild.from(data.source_guild);
        }

        if ("token" in data) {
            this.token = data.token;
        }

        this.type = data.type ?? this.type;

        if ("url" in data) {
            this.url = data.url;
        }

        if ("user" in data && data.user) {
            this.user = User.from(data.user);
        }
    }
}

export { WebhookTypes } from "@nyxjs/api-types";
