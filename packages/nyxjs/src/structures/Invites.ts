import type {
    Integer,
    InviteMetadataStructure,
    InviteStageInstanceStructure,
    InviteStructure,
    InviteTargetTypes,
    InviteTypes,
    IsoO8601Timestamp,
} from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Application } from "./Applications";
import { Base } from "./Base";
import { BaseChannel } from "./Channels";
import { GuildScheduledEvent } from "./GuildScheduledEvent";
import { Guild, GuildMember } from "./Guilds";
import { User } from "./Users";

export class InviteStageInstance extends Base<InviteStageInstanceStructure> {
    public members!: PickWithPublicMethods<
        GuildMember,
        "avatar" | "joinedAt" | "nick" | "pending" | "premiumSince" | "roles" | "user"
    >[];

    public participantCount!: Integer;

    public speakerCount!: Integer;

    public topic!: string;

    public constructor(data: Readonly<Partial<InviteStageInstanceStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<InviteStageInstanceStructure>>): void {
        if (data.members !== undefined) {
            this.members = data.members.map((member) => GuildMember.from(member));
        }

        if (data.participant_count !== undefined) {
            this.participantCount = data.participant_count;
        }

        if (data.speaker_count !== undefined) {
            this.speakerCount = data.speaker_count;
        }

        if (data.topic !== undefined) {
            this.topic = data.topic;
        }
    }
}

export class InviteMetadata extends Base<InviteMetadataStructure> {
    public createdAt!: IsoO8601Timestamp;

    public maxAge!: Integer;

    public maxUses!: Integer;

    public temporary!: boolean;

    public uses!: Integer;

    public constructor(data: Readonly<Partial<InviteMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<InviteMetadataStructure>>): void {
        if (data.created_at !== undefined) {
            this.createdAt = data.created_at;
        }

        if (data.max_age !== undefined) {
            this.maxAge = data.max_age;
        }

        if (data.max_uses !== undefined) {
            this.maxUses = data.max_uses;
        }

        if (data.temporary !== undefined) {
            this.temporary = data.temporary;
        }

        if (data.uses !== undefined) {
            this.uses = data.uses;
        }
    }
}

export class Invite extends Base<InviteStructure> {
    public approximateMemberCount?: Integer;

    public approximatePresenceCount?: Integer;

    public channel!: PickWithPublicMethods<BaseChannel, "id" | "name" | "type"> | null;

    public code!: string;

    public expiresAt?: IsoO8601Timestamp;

    public guild?: PickWithPublicMethods<
        Guild,
        | "banner"
        | "description"
        | "features"
        | "icon"
        | "id"
        | "name"
        | "nsfwLevel"
        | "premiumSubscriptionCount"
        | "splash"
        | "vanityUrlCode"
        | "verificationLevel"
    >;

    public guildScheduledEvent?: GuildScheduledEvent;

    public inviter?: User;

    public stageInstance?: InviteStageInstance;

    public targetApplication?: Partial<Application>;

    public targetType?: InviteTargetTypes;

    public targetUser?: User;

    public type!: InviteTypes;

    public constructor(data: Readonly<Partial<InviteStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<InviteStructure>>): void {
        if ("approximate_member_count" in data) {
            if (data.approximate_member_count === null) {
                this.approximateMemberCount = undefined;
            } else if (data.approximate_member_count !== undefined) {
                this.approximateMemberCount = data.approximate_member_count;
            }
        }

        if ("approximate_presence_count" in data) {
            if (data.approximate_presence_count === null) {
                this.approximatePresenceCount = undefined;
            } else if (data.approximate_presence_count !== undefined) {
                this.approximatePresenceCount = data.approximate_presence_count;
            }
        }

        if (data.channel !== undefined) {
            this.channel = BaseChannel.from(data.channel);
        }

        if (data.code !== undefined) {
            this.code = data.code;
        }

        if ("expires_at" in data) {
            if (data.expires_at === null) {
                this.expiresAt = undefined;
            } else if (data.expires_at !== undefined) {
                this.expiresAt = data.expires_at;
            }
        }

        if ("guild" in data) {
            if (data.guild === null) {
                this.guild = undefined;
            } else if (data.guild !== undefined) {
                this.guild = Guild.from(data.guild);
            }
        }

        if ("guild_scheduled_event" in data) {
            if (data.guild_scheduled_event === null) {
                this.guildScheduledEvent = undefined;
            } else if (data.guild_scheduled_event !== undefined) {
                this.guildScheduledEvent = GuildScheduledEvent.from(data.guild_scheduled_event);
            }
        }

        if ("inviter" in data) {
            if (data.inviter === null) {
                this.inviter = undefined;
            } else if (data.inviter !== undefined) {
                this.inviter = User.from(data.inviter);
            }
        }

        if ("stage_instance" in data) {
            if (data.stage_instance === null) {
                this.stageInstance = undefined;
            } else if (data.stage_instance !== undefined) {
                this.stageInstance = InviteStageInstance.from(data.stage_instance);
            }
        }

        if ("target_application" in data) {
            if (data.target_application === null) {
                this.targetApplication = undefined;
            } else if (data.target_application !== undefined) {
                this.targetApplication = Application.from(data.target_application);
            }
        }

        if ("target_type" in data) {
            if (data.target_type === null) {
                this.targetType = undefined;
            } else if (data.target_type !== undefined) {
                this.targetType = data.target_type;
            }
        }

        if ("target_user" in data) {
            if (data.target_user === null) {
                this.targetUser = undefined;
            } else if (data.target_user !== undefined) {
                this.targetUser = User.from(data.target_user);
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export { InviteTargetTypes, InviteTypes } from "@nyxjs/core";
