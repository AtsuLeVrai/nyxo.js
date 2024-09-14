import type { Snowflake, WebhookStructure, WebhookTypes } from "@nyxjs/core";
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

    public constructor(data: Readonly<Partial<WebhookStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<WebhookStructure>>): void {
        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if (data.avatar !== undefined) {
            this.avatar = data.avatar;
        }

        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else {
                this.guildId = data.guild_id;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("source_channel" in data) {
            if (data.source_channel === null) {
                this.sourceChannel = undefined;
            } else if (data.source_channel !== undefined) {
                this.sourceChannel = BaseChannel.from(data.source_channel);
            }
        }

        if ("source_guild" in data) {
            if (data.source_guild === null) {
                this.sourceGuild = undefined;
            } else if (data.source_guild !== undefined) {
                this.sourceGuild = Guild.from(data.source_guild);
            }
        }

        if ("token" in data) {
            if (data.token === null) {
                this.token = undefined;
            } else if (data.token !== undefined) {
                this.token = data.token.trim();
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("url" in data) {
            if (data.url === null) {
                this.url = undefined;
            } else if (data.url !== undefined) {
                this.url = data.url.trim();
            }
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = User.from(data.user);
            }
        }
    }
}
