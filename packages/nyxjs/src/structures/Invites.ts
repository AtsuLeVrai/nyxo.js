import type {
    InviteMetadataStructure,
    InviteStageInstanceStructure,
    InviteStructure,
    InviteTargetTypes,
    InviteTypes,
} from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp } from "@nyxjs/core";
import { Application } from "./Applications";
import { Base } from "./Base";
import { BaseChannel } from "./Channels";
import { Guild, GuildMember, GuildScheduledEvent } from "./Guilds";
import { User } from "./Users";

export class InviteStageInstance extends Base<InviteStageInstanceStructure> {
    public members!: Pick<
        GuildMember,
        "avatar" | "joinedAt" | "nick" | "pending" | "premiumSince" | "roles" | "user"
    >[];

    public participantCount!: Integer;

    public speakerCount!: Integer;

    public topic!: string;

    public constructor(data: Partial<InviteStageInstanceStructure>) {
        super(data);
    }

    protected patch(data: Partial<InviteStageInstanceStructure>): void {
        this.members = data.members ? data.members.map((member) => GuildMember.from(member)) : this.members;
        this.participantCount = data.participant_count ?? this.participantCount;
        this.speakerCount = data.speaker_count ?? this.speakerCount;
        this.topic = data.topic ?? this.topic;
    }
}

export class InviteMetadata extends Base<InviteMetadataStructure> {
    public createdAt!: IsoO8601Timestamp;

    public maxAge!: Integer;

    public maxUses!: Integer;

    public temporary!: boolean;

    public uses!: Integer;

    public constructor(data: Partial<InviteMetadataStructure>) {
        super(data);
    }

    protected patch(data: Partial<InviteMetadataStructure>): void {
        this.createdAt = data.created_at ?? this.createdAt;
        this.maxAge = data.max_age ?? this.maxAge;
        this.maxUses = data.max_uses ?? this.maxUses;
        this.temporary = data.temporary ?? this.temporary;
        this.uses = data.uses ?? this.uses;
    }
}

export class Invite extends Base<InviteStructure> {
    public approximateMemberCount?: Integer;

    public approximatePresenceCount?: Integer;

    public channel!: Pick<BaseChannel, "id" | "name" | "type"> | null;

    public code!: string;

    public expiresAt?: IsoO8601Timestamp;

    public guild?: Pick<
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

    public constructor(data: Partial<InviteStructure>) {
        super(data);
    }

    protected patch(data: Partial<InviteStructure>): void {
        if ("approximateMemberCount" in data) {
            this.approximateMemberCount = data.approximate_member_count;
        }

        if ("approximatePresenceCount" in data) {
            this.approximatePresenceCount = data.approximate_presence_count;
        }

        this.channel = data.channel ? BaseChannel.from(data.channel) : this.channel;
        this.code = data.code ?? this.code;

        if ("expires_at" in data) {
            this.expiresAt = data.expires_at;
        }

        if ("guild" in data && data.guild) {
            this.guild = Guild.from(data.guild);
        }

        if ("guild_scheduled_event" in data && data.guild_scheduled_event) {
            this.guildScheduledEvent = GuildScheduledEvent.from(data.guild_scheduled_event);
        }

        if ("inviter" in data && data.inviter) {
            this.inviter = User.from(data.inviter);
        }

        if ("stage_instance" in data && data.stage_instance) {
            this.stageInstance = InviteStageInstance.from(data.stage_instance);
        }

        if ("target_application" in data && data.target_application) {
            this.targetApplication = Application.from(data.target_application);
        }

        if ("target_type" in data) {
            this.targetType = data.target_type;
        }

        if ("target_user" in data && data.target_user) {
            this.targetUser = User.from(data.target_user);
        }

        this.type = data.type ?? this.type;
    }
}

export { InviteTargetTypes, InviteTypes } from "@nyxjs/api-types";
