import type {
    GuildScheduledEventEntityMetadataStructure,
    GuildScheduledEventEntityTypes,
    GuildScheduledEventPrivacyLevels,
    GuildScheduledEventStatus,
    GuildScheduledEventStructure,
    GuildScheduledEventUserStructure,
    RecurrenceRuleFrequencies,
    RecurrenceRuleMonths,
    RecurrenceRuleNweekdayStructure,
    RecurrenceRuleStructure,
    RecurrenceRuleWeekdays,
} from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { GuildMember } from "./Guilds";
import { User } from "./Users";

export class RecurrenceRuleNweekday extends Base<RecurrenceRuleNweekdayStructure> {
    public day!: RecurrenceRuleWeekdays;

    public n!: Integer;

    public constructor(data: Readonly<Partial<RecurrenceRuleNweekdayStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<RecurrenceRuleNweekdayStructure>>): void {
        if (data.day !== undefined) {
            this.day = data.day;
        }

        if (data.n !== undefined) {
            this.n = data.n;
        }
    }
}

export class RecurrenceRule extends Base<RecurrenceRuleStructure> {
    public byMonth!: RecurrenceRuleMonths[] | null;

    public byMonthDay!: Integer[] | null;

    public byNWeekday!: RecurrenceRuleNweekday[] | null;

    public byWeekday!: RecurrenceRuleWeekdays[] | null;

    public byYearDay!: Integer[] | null;

    public count!: Integer | null;

    public end?: IsoO8601Timestamp;

    public frequency!: RecurrenceRuleFrequencies;

    public interval!: Integer;

    public start!: IsoO8601Timestamp;

    public constructor(data: Readonly<Partial<RecurrenceRuleStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<RecurrenceRuleStructure>>): void {
        if (data.by_month !== undefined) {
            this.byMonth = data.by_month;
        }

        if (data.by_month_day !== undefined) {
            this.byMonthDay = data.by_month_day;
        }

        if (data.by_n_weekday !== undefined) {
            if (data.by_n_weekday === null) {
                this.byNWeekday = null;
            } else {
                this.byNWeekday = data.by_n_weekday.map((nweekday) => RecurrenceRuleNweekday.from(nweekday));
            }
        }

        if (data.by_weekday !== undefined) {
            this.byWeekday = data.by_weekday;
        }

        if (data.by_year_day !== undefined) {
            this.byYearDay = data.by_year_day;
        }

        if (data.count !== undefined) {
            this.count = data.count;
        }

        if ("end" in data) {
            if (data.end === null) {
                this.end = undefined;
            } else if (data.end !== undefined) {
                this.end = data.end;
            }
        }

        if (data.frequency !== undefined) {
            this.frequency = data.frequency;
        }

        if (data.interval !== undefined) {
            this.interval = data.interval;
        }

        if (data.start !== undefined) {
            this.start = data.start;
        }
    }
}

export class GuildScheduledEventUser extends Base<GuildScheduledEventUserStructure> {
    public guildScheduledEventId!: Snowflake;

    public member?: GuildMember;

    public user!: User;

    public constructor(data: Readonly<Partial<GuildScheduledEventUserStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildScheduledEventUserStructure>>): void {
        if (data.guild_scheduled_event_id !== undefined) {
            this.guildScheduledEventId = data.guild_scheduled_event_id;
        }

        if ("member" in data) {
            if (data.member === null) {
                this.member = undefined;
            } else if (data.member !== undefined) {
                this.member = GuildMember.from(data.member);
            }
        }

        if (data.user !== undefined) {
            this.user = User.from(data.user);
        }
    }
}

export class GuildScheduledEventEntityMetadata extends Base<GuildScheduledEventEntityMetadataStructure> {
    public location?: string;

    public constructor(data: Readonly<Partial<GuildScheduledEventEntityMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildScheduledEventEntityMetadataStructure>>): void {
        if ("location" in data) {
            if (data.location === null) {
                this.location = undefined;
            } else if (data.location !== undefined) {
                this.location = data.location;
            }
        }
    }
}

export class GuildScheduledEvent extends Base<GuildScheduledEventStructure> {
    public channelId!: Snowflake | null;

    public creator?: User;

    public creatorId?: Snowflake;

    public description?: string | null;

    public entityId!: Snowflake | null;

    public entityMetadata?: GuildScheduledEventEntityMetadata;

    public entityType!: GuildScheduledEventEntityTypes;

    public guildId!: Snowflake;

    public id!: Snowflake;

    public image?: string | null;

    public name!: string;

    public privacyLevel!: GuildScheduledEventPrivacyLevels;

    public recurrenceRule!: RecurrenceRule | null;

    public scheduledEndTime!: IsoO8601Timestamp | null;

    public scheduledStartTime!: IsoO8601Timestamp;

    public status!: GuildScheduledEventStatus;

    public userCount?: Integer;

    public constructor(data: Readonly<Partial<GuildScheduledEventStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildScheduledEventStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if ("creator" in data) {
            if (data.creator === null) {
                this.creator = undefined;
            } else if (data.creator !== undefined) {
                this.creator = User.from(data.creator);
            }
        }

        if ("creator_id" in data) {
            if (data.creator_id === null) {
                this.creatorId = undefined;
            } else {
                this.creatorId = data.creator_id;
            }
        }

        if ("description" in data) {
            if (data.description === null) {
                this.description = null;
            } else if (data.description !== undefined) {
                this.description = data.description;
            }
        }

        if (data.entity_id !== undefined) {
            this.entityId = data.entity_id;
        }

        if ("entity_metadata" in data) {
            if (data.entity_metadata === null) {
                this.entityMetadata = undefined;
            } else if (data.entity_metadata !== undefined) {
                this.entityMetadata = GuildScheduledEventEntityMetadata.from(data.entity_metadata);
            }
        }

        if (data.entity_type !== undefined) {
            this.entityType = data.entity_type;
        }

        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("image" in data) {
            if (data.image === null) {
                this.image = null;
            } else if (data.image !== undefined) {
                this.image = data.image;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }

        if (data.recurrence_rule !== undefined) {
            this.recurrenceRule = RecurrenceRule.from(data.recurrence_rule);
        }

        if (data.scheduled_end_time !== undefined) {
            this.scheduledEndTime = data.scheduled_end_time;
        }

        if (data.scheduled_start_time !== undefined) {
            this.scheduledStartTime = data.scheduled_start_time;
        }

        if (data.status !== undefined) {
            this.status = data.status;
        }

        if ("user_count" in data) {
            if (data.user_count === null) {
                this.userCount = undefined;
            } else if (data.user_count !== undefined) {
                this.userCount = data.user_count;
            }
        }
    }
}

export {
    GuildScheduledEventEntityTypes,
    GuildScheduledEventPrivacyLevels,
    GuildScheduledEventStatus,
    RecurrenceRuleFrequencies,
    RecurrenceRuleMonths,
    RecurrenceRuleWeekdays,
} from "@nyxjs/api-types";
