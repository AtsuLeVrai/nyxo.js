import {
    type GuildMemberStructure,
    type GuildScheduledEventEntityMetadataStructure,
    type GuildScheduledEventEntityTypes,
    type GuildScheduledEventPrivacyLevel,
    type GuildScheduledEventRecurrenceRuleFrequency,
    type GuildScheduledEventRecurrenceRuleMonth,
    type GuildScheduledEventRecurrenceRuleNWeekdayStructure,
    type GuildScheduledEventRecurrenceRuleStructure,
    GuildScheduledEventRecurrenceRuleWeekday,
    type GuildScheduledEventStatus,
    type GuildScheduledEventStructure,
    type GuildScheduledEventUserStructure,
    type Integer,
    type Iso8601Timestamp,
    type Snowflake,
    type UserStructure,
} from "@nyxjs/core";
import { Base } from "./Base.js";
import { GuildMember } from "./Guilds.js";
import { User } from "./Users.js";

export interface GuildScheduledEventRecurrenceRuleNWeekdaySchema {
    readonly day: GuildScheduledEventRecurrenceRuleWeekday | null;
    readonly n: 1 | 2 | 3 | 4 | 5 | null;
}

export class GuildScheduledEventRecurrenceRuleNWeekday
    extends Base<GuildScheduledEventRecurrenceRuleNWeekdayStructure, GuildScheduledEventRecurrenceRuleNWeekdaySchema>
    implements GuildScheduledEventRecurrenceRuleNWeekdaySchema
{
    #day: GuildScheduledEventRecurrenceRuleWeekday | null = null;
    #n: 1 | 2 | 3 | 4 | 5 | null = null;

    constructor(data: Partial<GuildScheduledEventRecurrenceRuleNWeekdayStructure>) {
        super();
        this.patch(data);
    }

    get day(): GuildScheduledEventRecurrenceRuleWeekday | null {
        return this.#day;
    }

    get n(): 1 | 2 | 3 | 4 | 5 | null {
        return this.#n;
    }

    static from(
        data: Partial<GuildScheduledEventRecurrenceRuleNWeekdayStructure>,
    ): GuildScheduledEventRecurrenceRuleNWeekday {
        return new GuildScheduledEventRecurrenceRuleNWeekday(data);
    }

    patch(data: Partial<GuildScheduledEventRecurrenceRuleNWeekdayStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.day !== undefined) {
            if (
                typeof data.day !== "number" ||
                !Object.values(GuildScheduledEventRecurrenceRuleWeekday).includes(data.day)
            ) {
                throw new TypeError("Invalid day value");
            }
            this.#day = data.day;
        }

        if (data.n !== undefined) {
            if (![1, 2, 3, 4, 5].includes(data.n)) {
                throw new TypeError("n must be between 1 and 5");
            }
            this.#n = data.n;
        }
    }

    toJson(): Partial<GuildScheduledEventRecurrenceRuleNWeekdayStructure> {
        return {
            day: this.#day ?? undefined,
            n: this.#n ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildScheduledEventRecurrenceRuleNWeekdaySchema {
        return {
            day: this.#day,
            n: this.#n,
        };
    }

    clone(): GuildScheduledEventRecurrenceRuleNWeekday {
        return new GuildScheduledEventRecurrenceRuleNWeekday(this.toJson());
    }

    reset(): void {
        this.#day = null;
        this.#n = null;
    }

    equals(other: Partial<GuildScheduledEventRecurrenceRuleNWeekday>): boolean {
        return Boolean(this.#day === other.day && this.#n === other.n);
    }
}

export interface GuildScheduledEventRecurrenceRuleSchema {
    readonly byMonth: GuildScheduledEventRecurrenceRuleMonth[] | null;
    readonly byMonthDay: Integer[] | null;
    readonly byNWeekday: GuildScheduledEventRecurrenceRuleNWeekday[] | null;
    readonly byWeekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;
    readonly byYearDay: Integer[] | null;
    readonly count: Integer | null;
    readonly end: Iso8601Timestamp | null;
    readonly frequency: GuildScheduledEventRecurrenceRuleFrequency | null;
    readonly interval: Integer | null;
    readonly start: Iso8601Timestamp | null;
}

export class GuildScheduledEventRecurrenceRule
    extends Base<GuildScheduledEventRecurrenceRuleStructure, GuildScheduledEventRecurrenceRuleSchema>
    implements GuildScheduledEventRecurrenceRuleSchema
{
    #byMonth: GuildScheduledEventRecurrenceRuleMonth[] = [];
    #byMonthDay: Integer[] = [];
    #byNWeekday: GuildScheduledEventRecurrenceRuleNWeekday[] = [];
    #byWeekday: GuildScheduledEventRecurrenceRuleWeekday[] = [];
    #byYearDay: Integer[] = [];
    #count: Integer | null = null;
    #end: Iso8601Timestamp | null = null;
    #frequency: GuildScheduledEventRecurrenceRuleFrequency | null = null;
    #interval: Integer | null = null;
    #start: Iso8601Timestamp | null = null;

    constructor(data: Partial<GuildScheduledEventRecurrenceRuleStructure>) {
        super();
        this.patch(data);
    }

    get byMonth(): GuildScheduledEventRecurrenceRuleMonth[] | null {
        return this.#byMonth.length > 0 ? [...this.#byMonth] : null;
    }

    get byMonthDay(): Integer[] | null {
        return this.#byMonthDay.length > 0 ? [...this.#byMonthDay] : null;
    }

    get byNWeekday(): GuildScheduledEventRecurrenceRuleNWeekday[] | null {
        return this.#byNWeekday.length > 0 ? [...this.#byNWeekday] : null;
    }

    get byWeekday(): GuildScheduledEventRecurrenceRuleWeekday[] | null {
        return this.#byWeekday.length > 0 ? [...this.#byWeekday] : null;
    }

    get byYearDay(): Integer[] | null {
        return this.#byYearDay.length > 0 ? [...this.#byYearDay] : null;
    }

    get count(): Integer | null {
        return this.#count;
    }

    get end(): Iso8601Timestamp | null {
        return this.#end;
    }

    get frequency(): GuildScheduledEventRecurrenceRuleFrequency | null {
        return this.#frequency;
    }

    get interval(): Integer | null {
        return this.#interval;
    }

    get start(): Iso8601Timestamp | null {
        return this.#start;
    }

    static from(data: Partial<GuildScheduledEventRecurrenceRuleStructure>): GuildScheduledEventRecurrenceRule {
        return new GuildScheduledEventRecurrenceRule(data);
    }

    patch(data: Partial<GuildScheduledEventRecurrenceRuleStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.by_month !== undefined) {
            this.#byMonth = data.by_month ? [...data.by_month] : [];
        }

        if (data.by_month_day !== undefined) {
            this.#byMonthDay = data.by_month_day ? [...data.by_month_day] : [];
        }

        if (data.by_n_weekday !== undefined) {
            this.#byNWeekday = data.by_n_weekday
                ? data.by_n_weekday.map((weekday) => GuildScheduledEventRecurrenceRuleNWeekday.from(weekday))
                : [];
        }

        if (data.by_weekday !== undefined) {
            this.#byWeekday = data.by_weekday ? [...data.by_weekday] : [];
        }

        if (data.by_year_day !== undefined) {
            if (data.by_year_day) {
                if (!data.by_year_day.every((day) => day >= 1 && day <= 364)) {
                    throw new RangeError("Year days must be between 1 and 364");
                }
                this.#byYearDay = [...data.by_year_day];
            } else {
                this.#byYearDay = [];
            }
        }

        this.#count = data.count ?? this.#count;
        this.#end = data.end ?? this.#end;
        this.#frequency = data.frequency ?? this.#frequency;
        this.#interval = data.interval ?? this.#interval;
        this.#start = data.start ?? this.#start;
    }

    toJson(): Partial<GuildScheduledEventRecurrenceRuleStructure> {
        return {
            by_month: this.#byMonth.length > 0 ? [...this.#byMonth] : null,
            by_month_day: this.#byMonthDay.length > 0 ? [...this.#byMonthDay] : null,
            by_n_weekday: (this.#byNWeekday.length > 0
                ? this.#byNWeekday.map((weekday) => weekday.toJson())
                : null) as GuildScheduledEventRecurrenceRuleNWeekdayStructure[],
            by_weekday: this.#byWeekday.length > 0 ? [...this.#byWeekday] : null,
            by_year_day: this.#byYearDay.length > 0 ? [...this.#byYearDay] : null,
            count: this.#count ?? undefined,
            end: this.#end ?? undefined,
            frequency: this.#frequency ?? undefined,
            interval: this.#interval ?? undefined,
            start: this.#start ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildScheduledEventRecurrenceRuleSchema {
        return {
            byMonth: this.byMonth,
            byMonthDay: this.byMonthDay,
            byNWeekday: this.byNWeekday,
            byWeekday: this.byWeekday,
            byYearDay: this.byYearDay,
            count: this.#count,
            end: this.#end,
            frequency: this.#frequency,
            interval: this.#interval,
            start: this.#start,
        };
    }

    clone(): GuildScheduledEventRecurrenceRule {
        return new GuildScheduledEventRecurrenceRule(this.toJson());
    }

    reset(): void {
        this.#byMonth = [];
        this.#byMonthDay = [];
        this.#byNWeekday = [];
        this.#byWeekday = [];
        this.#byYearDay = [];
        this.#count = null;
        this.#end = null;
        this.#frequency = null;
        this.#interval = null;
        this.#start = null;
    }

    equals(other: Partial<GuildScheduledEventRecurrenceRule>): boolean {
        return Boolean(
            JSON.stringify(this.#byMonth) === JSON.stringify(other.byMonth) &&
                JSON.stringify(this.#byMonthDay) === JSON.stringify(other.byMonthDay) &&
                JSON.stringify(this.#byNWeekday) === JSON.stringify(other.byNWeekday?.map((w) => w.valueOf())) &&
                JSON.stringify(this.#byWeekday) === JSON.stringify(other.byWeekday) &&
                JSON.stringify(this.#byYearDay) === JSON.stringify(other.byYearDay) &&
                this.#count === other.count &&
                this.#end === other.end &&
                this.#frequency === other.frequency &&
                this.#interval === other.interval &&
                this.#start === other.start,
        );
    }
}

export interface GuildScheduledEventUserSchema {
    readonly guildScheduledEventId: Snowflake | null;
    readonly member: GuildMember | null;
    readonly user: User | null;
}

export class GuildScheduledEventUser
    extends Base<GuildScheduledEventUserStructure, GuildScheduledEventUserSchema>
    implements GuildScheduledEventUserSchema
{
    #guildScheduledEventId: Snowflake | null = null;
    #member: GuildMember | null = null;
    #user: User | null = null;

    constructor(data: Partial<GuildScheduledEventUserStructure>) {
        super();
        this.patch(data);
    }

    get guildScheduledEventId(): Snowflake | null {
        return this.#guildScheduledEventId;
    }

    get member(): GuildMember | null {
        return this.#member;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<GuildScheduledEventUserStructure>): GuildScheduledEventUser {
        return new GuildScheduledEventUser(data);
    }

    patch(data: Partial<GuildScheduledEventUserStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#guildScheduledEventId = data.guild_scheduled_event_id ?? this.#guildScheduledEventId;
        this.#member = data.member ? GuildMember.from(data.member) : this.#member;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<GuildScheduledEventUserStructure> {
        return {
            guild_scheduled_event_id: this.#guildScheduledEventId ?? undefined,
            member: this.#member?.toJson() as GuildMemberStructure,
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildScheduledEventUserSchema {
        return {
            guildScheduledEventId: this.#guildScheduledEventId,
            member: this.#member,
            user: this.#user,
        };
    }

    clone(): GuildScheduledEventUser {
        return new GuildScheduledEventUser(this.toJson());
    }

    reset(): void {
        this.#guildScheduledEventId = null;
        this.#member = null;
        this.#user = null;
    }

    equals(other: Partial<GuildScheduledEventUser>): boolean {
        return Boolean(
            this.#guildScheduledEventId === other.guildScheduledEventId &&
                this.#member?.equals(other.member ?? {}) &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}

export interface GuildScheduledEventEntityMetadataSchema {
    readonly location: string | null;
}

export class GuildScheduledEventEntityMetadata
    extends Base<GuildScheduledEventEntityMetadataStructure, GuildScheduledEventEntityMetadataSchema>
    implements GuildScheduledEventEntityMetadataSchema
{
    #location: string | null = null;

    constructor(data: Partial<GuildScheduledEventEntityMetadataStructure>) {
        super();
        this.patch(data);
    }

    get location(): string | null {
        return this.#location;
    }

    static from(data: Partial<GuildScheduledEventEntityMetadataStructure>): GuildScheduledEventEntityMetadata {
        return new GuildScheduledEventEntityMetadata(data);
    }

    patch(data: Partial<GuildScheduledEventEntityMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.location !== undefined) {
            if (typeof data.location === "string") {
                if (data.location.length === 0 || data.location.length > 100) {
                    throw new RangeError("Location must be between 1 and 100 characters");
                }
                this.#location = data.location;
            } else {
                this.#location = null;
            }
        }
    }

    toJson(): Partial<GuildScheduledEventEntityMetadataStructure> {
        return {
            location: this.#location ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildScheduledEventEntityMetadataSchema {
        return {
            location: this.#location,
        };
    }

    clone(): GuildScheduledEventEntityMetadata {
        return new GuildScheduledEventEntityMetadata(this.toJson());
    }

    reset(): void {
        this.#location = null;
    }

    equals(other: Partial<GuildScheduledEventEntityMetadata>): boolean {
        return Boolean(this.#location === other.location);
    }
}

export interface GuildScheduledEventSchema {
    readonly channelId: Snowflake | null;
    readonly creator: User | null;
    readonly creatorId: Snowflake | null;
    readonly description: string | null;
    readonly entityId: Snowflake | null;
    readonly entityMetadata: GuildScheduledEventEntityMetadata | null;
    readonly entityType: GuildScheduledEventEntityTypes | null;
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly image: string | null;
    readonly name: string | null;
    readonly privacyLevel: GuildScheduledEventPrivacyLevel | null;
    readonly recurrenceRule: GuildScheduledEventRecurrenceRule | null;
    readonly scheduledEndTime: Iso8601Timestamp | null;
    readonly scheduledStartTime: Iso8601Timestamp | null;
    readonly status: GuildScheduledEventStatus | null;
    readonly userCount: Integer | null;
}

export class GuildScheduledEvent
    extends Base<GuildScheduledEventStructure, GuildScheduledEventSchema>
    implements GuildScheduledEventSchema
{
    #channelId: Snowflake | null = null;
    #creator: User | null = null;
    #creatorId: Snowflake | null = null;
    #description: string | null = null;
    #entityId: Snowflake | null = null;
    #entityMetadata: GuildScheduledEventEntityMetadata | null = null;
    #entityType: GuildScheduledEventEntityTypes | null = null;
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #image: string | null = null;
    #name: string | null = null;
    #privacyLevel: GuildScheduledEventPrivacyLevel | null = null;
    #recurrenceRule: GuildScheduledEventRecurrenceRule | null = null;
    #scheduledEndTime: Iso8601Timestamp | null = null;
    #scheduledStartTime: Iso8601Timestamp | null = null;
    #status: GuildScheduledEventStatus | null = null;
    #userCount: Integer | null = null;

    constructor(data: Partial<GuildScheduledEventStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
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

    get entityId(): Snowflake | null {
        return this.#entityId;
    }

    get entityMetadata(): GuildScheduledEventEntityMetadata | null {
        return this.#entityMetadata;
    }

    get entityType(): GuildScheduledEventEntityTypes | null {
        return this.#entityType;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get image(): string | null {
        return this.#image;
    }

    get name(): string | null {
        return this.#name;
    }

    get privacyLevel(): GuildScheduledEventPrivacyLevel | null {
        return this.#privacyLevel;
    }

    get recurrenceRule(): GuildScheduledEventRecurrenceRule | null {
        return this.#recurrenceRule;
    }

    get scheduledEndTime(): Iso8601Timestamp | null {
        return this.#scheduledEndTime;
    }

    get scheduledStartTime(): Iso8601Timestamp | null {
        return this.#scheduledStartTime;
    }

    get status(): GuildScheduledEventStatus | null {
        return this.#status;
    }

    get userCount(): Integer | null {
        return this.#userCount;
    }

    static from(data: Partial<GuildScheduledEventStructure>): GuildScheduledEvent {
        return new GuildScheduledEvent(data);
    }

    patch(data: Partial<GuildScheduledEventStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#creator = data.creator ? User.from(data.creator) : this.#creator;
        this.#creatorId = data.creator_id ?? this.#creatorId;

        if (data.description !== undefined) {
            if (typeof data.description === "string") {
                if (data.description.length === 0 || data.description.length > 1000) {
                    throw new RangeError("Description must be between 1 and 1000 characters");
                }
                this.#description = data.description;
            } else {
                this.#description = null;
            }
        }

        this.#entityId = data.entity_id ?? this.#entityId;
        this.#entityMetadata = data.entity_metadata
            ? GuildScheduledEventEntityMetadata.from(data.entity_metadata)
            : this.#entityMetadata;
        this.#entityType = data.entity_type ?? this.#entityType;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#image = data.image ?? this.#image;

        if (data.name !== undefined) {
            if (typeof data.name === "string") {
                if (data.name.length === 0 || data.name.length > 100) {
                    throw new RangeError("Name must be between 1 and 100 characters");
                }
                this.#name = data.name;
            } else {
                this.#name = null;
            }
        }

        this.#privacyLevel = data.privacy_level ?? this.#privacyLevel;
        this.#recurrenceRule = data.recurrence_rule
            ? GuildScheduledEventRecurrenceRule.from(data.recurrence_rule)
            : this.#recurrenceRule;
        this.#scheduledEndTime = data.scheduled_end_time ?? this.#scheduledEndTime;
        this.#scheduledStartTime = data.scheduled_start_time ?? this.#scheduledStartTime;
        this.#status = data.status ?? this.#status;
        this.#userCount = data.user_count ?? this.#userCount;
    }

    toJson(): Partial<GuildScheduledEventStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            creator: this.#creator?.toJson() as UserStructure,
            creator_id: this.#creatorId ?? undefined,
            description: this.#description ?? undefined,
            entity_id: this.#entityId ?? undefined,
            entity_metadata: this.#entityMetadata?.toJson(),
            entity_type: this.#entityType ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            image: this.#image ?? undefined,
            name: this.#name ?? undefined,
            privacy_level: this.#privacyLevel ?? undefined,
            recurrence_rule: this.#recurrenceRule?.toJson() as GuildScheduledEventRecurrenceRuleStructure,
            scheduled_end_time: this.#scheduledEndTime ?? undefined,
            scheduled_start_time: this.#scheduledStartTime ?? undefined,
            status: this.#status ?? undefined,
            user_count: this.#userCount ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildScheduledEventSchema {
        return {
            channelId: this.#channelId,
            creator: this.#creator,
            creatorId: this.#creatorId,
            description: this.#description,
            entityId: this.#entityId,
            entityMetadata: this.#entityMetadata,
            entityType: this.#entityType,
            guildId: this.#guildId,
            id: this.#id,
            image: this.#image,
            name: this.#name,
            privacyLevel: this.#privacyLevel,
            recurrenceRule: this.#recurrenceRule,
            scheduledEndTime: this.#scheduledEndTime,
            scheduledStartTime: this.#scheduledStartTime,
            status: this.#status,
            userCount: this.#userCount,
        };
    }

    clone(): GuildScheduledEvent {
        return new GuildScheduledEvent(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#creator = null;
        this.#creatorId = null;
        this.#description = null;
        this.#entityId = null;
        this.#entityMetadata = null;
        this.#entityType = null;
        this.#guildId = null;
        this.#id = null;
        this.#image = null;
        this.#name = null;
        this.#privacyLevel = null;
        this.#recurrenceRule = null;
        this.#scheduledEndTime = null;
        this.#scheduledStartTime = null;
        this.#status = null;
        this.#userCount = null;
    }

    equals(other: Partial<GuildScheduledEvent>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#creator?.equals(other.creator ?? {}) &&
                this.#creatorId === other.creatorId &&
                this.#description === other.description &&
                this.#entityId === other.entityId &&
                this.#entityMetadata?.equals(other.entityMetadata ?? {}) &&
                this.#entityType === other.entityType &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#image === other.image &&
                this.#name === other.name &&
                this.#privacyLevel === other.privacyLevel &&
                this.#recurrenceRule?.equals(other.recurrenceRule ?? {}) &&
                this.#scheduledEndTime === other.scheduledEndTime &&
                this.#scheduledStartTime === other.scheduledStartTime &&
                this.#status === other.status &&
                this.#userCount === other.userCount,
        );
    }
}
