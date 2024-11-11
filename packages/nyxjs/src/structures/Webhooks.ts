import type {
    ChannelStructure,
    GuildStructure,
    Snowflake,
    UserStructure,
    WebhookStructure,
    WebhookTypes,
} from "@nyxjs/core";
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface WebhookSchema {
    readonly applicationId: Snowflake | null;
    readonly avatar: string | null;
    readonly channelId: Snowflake | null;
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly sourceChannel: Pick<ChannelStructure, "id" | "name"> | null;
    readonly sourceGuild: Pick<GuildStructure, "icon" | "id" | "name"> | null;
    readonly token: string | null;
    readonly type: WebhookTypes | null;
    readonly url: string | null;
    readonly user: User | null;
}

export class Webhook extends Base<WebhookStructure, WebhookSchema> implements WebhookSchema {
    #applicationId: Snowflake | null = null;
    #avatar: string | null = null;
    #channelId: Snowflake | null = null;
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #sourceChannel: Pick<ChannelStructure, "id" | "name"> | null = null;
    #sourceGuild: Pick<GuildStructure, "icon" | "id" | "name"> | null = null;
    #token: string | null = null;
    #type: WebhookTypes | null = null;
    #url: string | null = null;
    #user: User | null = null;

    constructor(data: Partial<WebhookStructure>) {
        super();
        this.patch(data);
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get avatar(): string | null {
        return this.#avatar;
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get sourceChannel(): Pick<ChannelStructure, "id" | "name"> | null {
        return this.#sourceChannel;
    }

    get sourceGuild(): Pick<GuildStructure, "icon" | "id" | "name"> | null {
        return this.#sourceGuild;
    }

    get token(): string | null {
        return this.#token;
    }

    get type(): WebhookTypes | null {
        return this.#type;
    }

    get url(): string | null {
        return this.#url;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<WebhookStructure>): Webhook {
        return new Webhook(data);
    }

    patch(data: Partial<WebhookStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#avatar = data.avatar ?? this.#avatar;
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#sourceChannel = data.source_channel ?? this.#sourceChannel;
        this.#sourceGuild = data.source_guild ?? this.#sourceGuild;
        this.#token = data.token ?? this.#token;
        this.#type = data.type ?? this.#type;
        this.#url = data.url ?? this.#url;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<WebhookStructure> {
        return {
            application_id: this.#applicationId ?? undefined,
            avatar: this.#avatar ?? undefined,
            channel_id: this.#channelId ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            source_channel: this.#sourceChannel ?? undefined,
            source_guild: this.#sourceGuild ?? undefined,
            token: this.#token ?? undefined,
            type: this.#type ?? undefined,
            url: this.#url ?? undefined,
            user: (this.#user?.toJson() as UserStructure) ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): WebhookSchema {
        return {
            applicationId: this.#applicationId,
            avatar: this.#avatar,
            channelId: this.#channelId,
            guildId: this.#guildId,
            id: this.#id,
            name: this.#name,
            sourceChannel: this.#sourceChannel,
            sourceGuild: this.#sourceGuild,
            token: this.#token,
            type: this.#type,
            url: this.#url,
            user: this.#user,
        };
    }

    clone(): Webhook {
        return new Webhook(this.toJson());
    }

    reset(): void {
        this.#applicationId = null;
        this.#avatar = null;
        this.#channelId = null;
        this.#guildId = null;
        this.#id = null;
        this.#name = null;
        this.#sourceChannel = null;
        this.#sourceGuild = null;
        this.#token = null;
        this.#type = null;
        this.#url = null;
        this.#user = null;
    }

    equals(other: Partial<Webhook>): boolean {
        return Boolean(
            this.#applicationId === other.applicationId &&
                this.#avatar === other.avatar &&
                this.#channelId === other.channelId &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#name === other.name &&
                JSON.stringify(this.#sourceChannel) === JSON.stringify(other.sourceChannel) &&
                JSON.stringify(this.#sourceGuild) === JSON.stringify(other.sourceGuild) &&
                this.#token === other.token &&
                this.#type === other.type &&
                this.#url === other.url &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}
