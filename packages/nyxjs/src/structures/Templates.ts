import type {
    GuildStructure,
    GuildTemplateStructure,
    Integer,
    Iso8601Timestamp,
    Snowflake,
    UserStructure,
} from "@nyxjs/core";
import type { PickWithMethods } from "../types/index.js";
import { Base } from "./Base.js";
import { Guild } from "./Guilds.js";
import { User } from "./Users.js";

export interface GuildTemplateSchema {
    readonly code: string | null;
    readonly createdAt: Iso8601Timestamp | null;
    readonly creator: User | null;
    readonly creatorId: Snowflake | null;
    readonly description: string | null;
    readonly isDirty: boolean;
    readonly name: string | null;
    readonly serializedSourceGuild: PickWithMethods<
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
        | "verificationLevel"
    > | null;
    readonly sourceGuildId: Snowflake | null;
    readonly updatedAt: Iso8601Timestamp | null;
    readonly usageCount: Integer | null;
}

export class GuildTemplate extends Base<GuildTemplateStructure, GuildTemplateSchema> {
    #code: string | null = null;
    #createdAt: Iso8601Timestamp | null = null;
    #creator: User | null = null;
    #creatorId: Snowflake | null = null;
    #description: string | null = null;
    #isDirty = false;
    #name: string | null = null;
    /**
     * @todo This should have "channels" property.
     */
    #serializedSourceGuild: PickWithMethods<
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
        | "verificationLevel"
    > | null = null;
    #sourceGuildId: Snowflake | null = null;
    #updatedAt: Iso8601Timestamp | null = null;
    #usageCount: Integer | null = null;

    constructor(data: Partial<GuildTemplateStructure>) {
        super();
        this.patch(data);
    }

    get code(): string | null {
        return this.#code;
    }

    get createdAt(): Iso8601Timestamp | null {
        return this.#createdAt;
    }

    get creator(): User | null {
        return this.#creator;
    }

    get creatorId(): Snowflake | null {
        return this.#creatorId;
    }

    get description(): string | null {
        return this.#description;
    }

    get isDirty(): boolean {
        return this.#isDirty;
    }

    get name(): string | null {
        return this.#name;
    }

    get serializedSourceGuild(): PickWithMethods<Guild, keyof GuildTemplateSchema["serializedSourceGuild"]> | null {
        return this.#serializedSourceGuild;
    }

    get sourceGuildId(): Snowflake | null {
        return this.#sourceGuildId;
    }

    get updatedAt(): Iso8601Timestamp | null {
        return this.#updatedAt;
    }

    get usageCount(): Integer | null {
        return this.#usageCount;
    }

    static from(data: Partial<GuildTemplateStructure>): GuildTemplate {
        return new GuildTemplate(data);
    }

    patch(data: Partial<GuildTemplateStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#code = data.code ?? this.#code;
        this.#createdAt = data.created_at ?? this.#createdAt;
        this.#creator = data.creator ? User.from(data.creator) : this.#creator;
        this.#creatorId = data.creator_id ?? this.#creatorId;
        this.#description = data.description ?? this.#description;
        this.#isDirty = Boolean(data.is_dirty ?? this.#isDirty);
        this.#name = data.name ?? this.#name;
        this.#serializedSourceGuild = data.serialized_source_guild
            ? Guild.from(data.serialized_source_guild)
            : this.#serializedSourceGuild;
        this.#sourceGuildId = data.source_guild_id ?? this.#sourceGuildId;
        this.#updatedAt = data.updated_at ?? this.#updatedAt;
        this.#usageCount = data.usage_count ?? this.#usageCount;
    }

    toJson(): Partial<GuildTemplateStructure> {
        return {
            code: this.#code ?? undefined,
            created_at: this.#createdAt ?? undefined,
            creator: this.#creator?.toJson() as UserStructure,
            creator_id: this.#creatorId ?? undefined,
            description: this.#description ?? undefined,
            is_dirty: this.#isDirty,
            name: this.#name ?? undefined,
            serialized_source_guild: this.#serializedSourceGuild?.toJson() as GuildStructure,
            source_guild_id: this.#sourceGuildId ?? undefined,
            updated_at: this.#updatedAt ?? undefined,
            usage_count: this.#usageCount ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildTemplateSchema {
        return {
            code: this.#code,
            createdAt: this.#createdAt,
            creator: this.#creator,
            creatorId: this.#creatorId,
            description: this.#description,
            isDirty: this.#isDirty,
            name: this.#name,
            serializedSourceGuild: this.#serializedSourceGuild,
            sourceGuildId: this.#sourceGuildId,
            updatedAt: this.#updatedAt,
            usageCount: this.#usageCount,
        };
    }

    clone(): GuildTemplate {
        return new GuildTemplate(this.toJson());
    }

    reset(): void {
        this.#code = null;
        this.#createdAt = null;
        this.#creator = null;
        this.#creatorId = null;
        this.#description = null;
        this.#isDirty = false;
        this.#name = null;
        this.#serializedSourceGuild = null;
        this.#sourceGuildId = null;
        this.#updatedAt = null;
        this.#usageCount = null;
    }

    equals(other: Partial<GuildTemplate>): boolean {
        return Boolean(
            this.#code === other.code &&
                this.#createdAt === other.createdAt &&
                this.#creator?.equals(other.creator ?? this.#creator) &&
                this.#creatorId === other.creatorId &&
                this.#description === other.description &&
                this.#isDirty === other.isDirty &&
                this.#name === other.name &&
                this.#serializedSourceGuild?.equals(other.serializedSourceGuild ?? this.#serializedSourceGuild) &&
                this.#sourceGuildId === other.sourceGuildId &&
                this.#updatedAt === other.updatedAt &&
                this.#usageCount === other.usageCount,
        );
    }
}
