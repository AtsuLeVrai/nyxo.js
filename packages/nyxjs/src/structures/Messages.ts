import type {
    AllowedMentionsStructure,
    AllowedMentionTypes,
    AttachmentStructure,
    ChannelMentionStructure,
    ChannelTypes,
    ContentTypes,
    Float,
    Integer,
    InteractionTypes,
    IsoO8601Timestamp,
    MessageActivityStructure,
    MessageActivityTypes,
    MessageCallStructure,
    MessageFlags,
    MessageInteractionMetadataStructure,
    MessageReferenceStructure,
    MessageReferenceTypes,
    MessageSnapshotStructure,
    MessageStructure,
    MessageTypes,
    ReactionCountDetailsStructure,
    ReactionStructure,
    RoleSubscriptionDataStructure,
    Snowflake,
} from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Application } from "./Applications";
import { Base } from "./Base";
import { ThreadChannel } from "./Channels";
import { Embed } from "./Embed";
import { Emoji } from "./Emojis";
import { ActionRow, MessageInteraction, ResolvedData } from "./Interactions";
import { Poll } from "./Polls";
import { Sticker, StickerItem } from "./Stickers";
import { User } from "./Users";

export class RoleSubscriptionData extends Base<RoleSubscriptionDataStructure> {
    public isRenewal!: boolean;

    public roleSubscriptionListingId!: Snowflake;

    public tierName!: string;

    public totalMonthsSubscribed!: Integer;

    public constructor(data: Readonly<Partial<RoleSubscriptionDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<RoleSubscriptionDataStructure>>): void {
        if (data.is_renewal !== undefined) {
            this.isRenewal = data.is_renewal;
        }

        if (data.role_subscription_listing_id !== undefined) {
            this.roleSubscriptionListingId = data.role_subscription_listing_id;
        }

        if (data.tier_name !== undefined) {
            this.tierName = data.tier_name;
        }

        if (data.total_months_subscribed !== undefined) {
            this.totalMonthsSubscribed = data.total_months_subscribed;
        }
    }
}

export class AllowedMentions extends Base<AllowedMentionsStructure> {
    public parse!: AllowedMentionTypes[];

    public repliedUser!: boolean;

    public roles!: Snowflake[];

    public users!: Snowflake[];

    public constructor(data: Readonly<Partial<AllowedMentionsStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AllowedMentionsStructure>>): void {
        if (data.parse !== undefined) {
            this.parse = data.parse;
        }

        if (data.replied_user !== undefined) {
            this.repliedUser = data.replied_user;
        }

        if (data.roles !== undefined) {
            this.roles = data.roles;
        }

        if (data.users !== undefined) {
            this.users = data.users;
        }
    }
}

export class ChannelMention extends Base<ChannelMentionStructure> {
    public guildId!: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public type!: ChannelTypes;

    public constructor(data: Readonly<Partial<ChannelMentionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelMentionStructure>>): void {
        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class Attachment extends Base<AttachmentStructure> {
    public contentType?: ContentTypes;

    public description?: string;

    public durationSecs?: Float;

    public ephemeral?: boolean;

    public filename!: string;

    public flags?: Integer;

    public height?: Integer | null;

    public id!: Snowflake;

    public proxyUrl!: string;

    public size!: Integer;

    public title?: string;

    public url!: string;

    public waveform?: string;

    public width?: Integer | null;

    public constructor(data: Readonly<Partial<AttachmentStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AttachmentStructure>>): void {
        if ("content_type" in data) {
            if (data.content_type === null) {
                this.contentType = undefined;
            } else if (data.content_type !== undefined) {
                this.contentType = data.content_type;
            }
        }

        if ("description" in data) {
            if (data.description === null) {
                this.description = undefined;
            } else if (data.description !== undefined) {
                this.description = data.description;
            }
        }

        if ("duration_secs" in data) {
            if (data.duration_secs === null) {
                this.durationSecs = undefined;
            } else if (data.duration_secs !== undefined) {
                this.durationSecs = data.duration_secs;
            }
        }

        if ("ephemeral" in data) {
            if (data.ephemeral === null) {
                this.ephemeral = undefined;
            } else if (data.ephemeral !== undefined) {
                this.ephemeral = data.ephemeral;
            }
        }

        if (data.filename !== undefined) {
            this.filename = data.filename;
        }

        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else if (data.flags !== undefined) {
                this.flags = data.flags;
            }
        }

        if ("height" in data) {
            if (data.height === null) {
                this.height = undefined;
            } else if (data.height !== undefined) {
                this.height = data.height;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.proxy_url !== undefined) {
            this.proxyUrl = data.proxy_url;
        }

        if (data.size !== undefined) {
            this.size = data.size;
        }

        if ("title" in data) {
            if (data.title === null) {
                this.title = undefined;
            } else if (data.title !== undefined) {
                this.title = data.title;
            }
        }

        if (data.url !== undefined) {
            this.url = data.url;
        }

        if ("waveform" in data) {
            if (data.waveform === null) {
                this.waveform = undefined;
            } else if (data.waveform !== undefined) {
                this.waveform = data.waveform;
            }
        }

        if ("width" in data) {
            if (data.width === null) {
                this.width = undefined;
            } else if (data.width !== undefined) {
                this.width = data.width;
            }
        }
    }
}

export class ReactionCountDetails extends Base<ReactionCountDetailsStructure> {
    public burst!: Integer;

    public normal!: Integer;

    public constructor(data: Partial<ReactionCountDetailsStructure>) {
        super(data);
    }

    protected patch(data: Partial<ReactionCountDetailsStructure>): void {
        this.burst = data.burst ?? this.burst;
        this.normal = data.normal ?? this.normal;
    }
}

export class Reaction extends Base<ReactionStructure> {
    public burstColors!: string[];

    public count!: Integer;

    public countDetails!: ReactionCountDetails;

    public emoji!: PickWithPublicMethods<Emoji, "animated" | "id" | "name">;

    public me!: boolean;

    public meBurst!: boolean;

    public constructor(data: Readonly<Partial<ReactionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ReactionStructure>>): void {
        if (data.burst_colors !== undefined) {
            this.burstColors = data.burst_colors;
        }

        if (data.count !== undefined) {
            this.count = data.count;
        }

        if (data.count_details !== undefined) {
            this.countDetails = ReactionCountDetails.from(data.count_details);
        }

        if (data.emoji !== undefined) {
            this.emoji = Emoji.from(data.emoji);
        }

        if (data.me !== undefined) {
            this.me = data.me;
        }

        if (data.me_burst !== undefined) {
            this.meBurst = data.me_burst;
        }
    }
}

export class MessageReference extends Base<MessageReferenceStructure> {
    public channelId?: Snowflake;

    public failIfNotExists?: boolean;

    public guildId?: Snowflake;

    public messageId?: Snowflake;

    public type?: MessageReferenceTypes;

    public constructor(data: Readonly<Partial<MessageReferenceStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageReferenceStructure>>): void {
        if ("channel_id" in data) {
            if (data.channel_id === null) {
                this.channelId = undefined;
            } else if (data.channel_id !== undefined) {
                this.channelId = data.channel_id;
            }
        }

        if ("fail_if_not_exists" in data) {
            if (data.fail_if_not_exists === null) {
                this.failIfNotExists = undefined;
            } else if (data.fail_if_not_exists !== undefined) {
                this.failIfNotExists = data.fail_if_not_exists;
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else if (data.guild_id !== undefined) {
                this.guildId = data.guild_id;
            }
        }

        if ("message_id" in data) {
            if (data.message_id === null) {
                this.messageId = undefined;
            } else if (data.message_id !== undefined) {
                this.messageId = data.message_id;
            }
        }

        if ("type" in data) {
            if (data.type === null) {
                this.type = undefined;
            } else if (data.type !== undefined) {
                this.type = data.type;
            }
        }
    }
}

export class MessageCall extends Base<MessageCallStructure> {
    public endedTimestamp?: IsoO8601Timestamp | null;

    public participants!: Snowflake[];

    public constructor(data: Readonly<Partial<MessageCallStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageCallStructure>>): void {
        if ("ended_timestamp" in data) {
            if (data.ended_timestamp === null) {
                this.endedTimestamp = undefined;
            } else if (data.ended_timestamp !== undefined) {
                this.endedTimestamp = data.ended_timestamp;
            }
        }

        if (data.participants !== undefined) {
            this.participants = data.participants;
        }
    }
}

export class MessageInteractionMetadata extends Base<MessageInteractionMetadataStructure> {
    public authorizingIntegrationOwners!: Record<string, Snowflake>;

    public id!: Snowflake;

    public interactedMessageId?: Snowflake;

    public originalResponseMessageId?: Snowflake;

    public triggeringInteractionMetadata?: MessageInteractionMetadata;

    public type!: InteractionTypes;

    public user!: User;

    public constructor(data: Readonly<Partial<MessageInteractionMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageInteractionMetadataStructure>>): void {
        if (data.authorizing_integration_owners !== undefined) {
            this.authorizingIntegrationOwners = data.authorizing_integration_owners;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("interacted_message_id" in data) {
            if (data.interacted_message_id === null) {
                this.interactedMessageId = undefined;
            } else if (data.interacted_message_id !== undefined) {
                this.interactedMessageId = data.interacted_message_id;
            }
        }

        if ("original_response_message_id" in data) {
            if (data.original_response_message_id === null) {
                this.originalResponseMessageId = undefined;
            } else if (data.original_response_message_id !== undefined) {
                this.originalResponseMessageId = data.original_response_message_id;
            }
        }

        if ("triggering_interaction_metadata" in data) {
            if (data.triggering_interaction_metadata === null) {
                this.triggeringInteractionMetadata = undefined;
            } else if (data.triggering_interaction_metadata !== undefined) {
                this.triggeringInteractionMetadata = MessageInteractionMetadata.from(
                    data.triggering_interaction_metadata
                );
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if (data.user !== undefined) {
            this.user = User.from(data.user);
        }
    }
}

export class MessageActivity extends Base<MessageActivityStructure> {
    public partyId?: string;

    public type!: MessageActivityTypes;

    public constructor(data: Readonly<Partial<MessageActivityStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageActivityStructure>>): void {
        if ("party_id" in data) {
            if (data.party_id === null) {
                this.partyId = undefined;
            } else if (data.party_id !== undefined) {
                this.partyId = data.party_id;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class MessageSnapshot extends Base<MessageSnapshotStructure> {
    public message!: PickWithPublicMethods<
        Message,
        | "attachments"
        | "content"
        | "editedTimestamp"
        | "embeds"
        | "flags"
        | "mentionRoles"
        | "mentions"
        | "timestamp"
        | "type"
    >;

    public constructor(data: Readonly<Partial<MessageSnapshotStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageSnapshotStructure>>): void {
        if (data.message !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            this.message = Message.from(data.message);
        }
    }
}

export class Message extends Base<MessageStructure> {
    public activity?: MessageActivity;

    public application?: Partial<Application>;

    public applicationId?: Snowflake;

    public attachments!: Attachment[];

    public author!: User;

    public call?: MessageCall;

    public channelId!: Snowflake;

    public components?: ActionRow[];

    public content!: string;

    public editedTimestamp!: IsoO8601Timestamp | null;

    public embeds!: Embed[];

    public flags?: MessageFlags;

    public id!: Snowflake;

    /**
     * @deprecated Use `interactionMetadata` instead
     */
    public interaction?: MessageInteractionMetadata;

    public interactionMetadata?: MessageInteraction;

    public mentionChannels?: ChannelMention[];

    public mentionEveryone!: boolean;

    public mentionRoles!: Snowflake[];

    public mentions!: User[];

    public messageReference?: MessageReference;

    public messageSnapshots?: MessageSnapshot[];

    public nonce?: Integer | string;

    public pinned!: boolean;

    public poll?: Poll;

    public position?: Integer;

    public reactions?: Reaction[];

    public referencedMessage?: Message | null;

    public resolved?: ResolvedData;

    public roleSubscriptionData?: RoleSubscriptionData;

    public stickerItems?: StickerItem[];

    /**
     * @deprecated Use `stickerItems` instead
     */
    public stickers?: Sticker[];

    public thread?: ThreadChannel;

    public timestamp!: IsoO8601Timestamp;

    public tts!: boolean;

    public type!: MessageTypes;

    public webhookId?: Snowflake;

    public constructor(data: Readonly<Partial<MessageStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageStructure>>): void {
        if ("activity" in data) {
            if (data.activity === null) {
                this.activity = undefined;
            } else if (data.activity !== undefined) {
                this.activity = MessageActivity.from(data.activity);
            }
        }

        if ("application" in data) {
            if (data.application === null) {
                this.application = undefined;
            } else if (data.application !== undefined) {
                this.application = Application.from(data.application);
            }
        }

        if ("application_id" in data) {
            if (data.application_id === null) {
                this.applicationId = undefined;
            } else if (data.application_id !== undefined) {
                this.applicationId = data.application_id;
            }
        }

        if (data.attachments !== undefined) {
            this.attachments = data.attachments.map((attachment) => Attachment.from(attachment));
        }

        if (data.author !== undefined) {
            this.author = User.from(data.author);
        }

        if ("call" in data) {
            if (data.call === null) {
                this.call = undefined;
            } else if (data.call !== undefined) {
                this.call = MessageCall.from(data.call);
            }
        }

        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if ("components" in data) {
            if (data.components === null) {
                this.components = undefined;
            } else if (data.components !== undefined) {
                this.components = data.components.map((component) => ActionRow.from(component));
            }
        }

        if (data.content !== undefined) {
            this.content = data.content;
        }

        if ("edited_timestamp" in data) {
            if (data.edited_timestamp === null) {
                this.editedTimestamp = null;
            } else if (data.edited_timestamp !== undefined) {
                this.editedTimestamp = data.edited_timestamp;
            }
        }

        if (data.embeds !== undefined) {
            this.embeds = data.embeds.map((embed) => Embed.from(embed));
        }

        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else if (data.flags !== undefined) {
                this.flags = data.flags;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("interaction" in data) {
            if (data.interaction === null) {
                this.interaction = undefined;
            } else if (data.interaction !== undefined) {
                this.interaction = MessageInteractionMetadata.from(data.interaction);
            }
        }

        if ("interaction_metadata" in data) {
            if (data.interaction_metadata === null) {
                this.interactionMetadata = undefined;
            } else if (data.interaction_metadata !== undefined) {
                this.interactionMetadata = MessageInteraction.from(data.interaction_metadata);
            }
        }

        if ("mention_channels" in data) {
            if (data.mention_channels === null) {
                this.mentionChannels = undefined;
            } else if (data.mention_channels !== undefined) {
                this.mentionChannels = data.mention_channels.map((mentionChannel) =>
                    ChannelMention.from(mentionChannel)
                );
            }
        }

        if (data.mention_everyone !== undefined) {
            this.mentionEveryone = data.mention_everyone;
        }

        if (data.mention_roles !== undefined) {
            this.mentionRoles = data.mention_roles;
        }

        if (data.mentions !== undefined) {
            this.mentions = data.mentions.map((mention) => User.from(mention));
        }

        if ("message_reference" in data) {
            if (data.message_reference === null) {
                this.messageReference = undefined;
            } else if (data.message_reference !== undefined) {
                this.messageReference = MessageReference.from(data.message_reference);
            }
        }

        if ("message_snapshots" in data) {
            if (data.message_snapshots === null) {
                this.messageSnapshots = undefined;
            } else if (data.message_snapshots !== undefined) {
                this.messageSnapshots = data.message_snapshots.map((messageSnapshot) =>
                    MessageSnapshot.from(messageSnapshot)
                );
            }
        }

        if ("nonce" in data) {
            if (data.nonce === null) {
                this.nonce = undefined;
            } else if (data.nonce !== undefined) {
                this.nonce = data.nonce;
            }
        }

        if (data.pinned !== undefined) {
            this.pinned = data.pinned;
        }

        if ("poll" in data) {
            if (data.poll === null) {
                this.poll = undefined;
            } else if (data.poll !== undefined) {
                this.poll = Poll.from(data.poll);
            }
        }

        if ("position" in data) {
            if (data.position === null) {
                this.position = undefined;
            } else if (data.position !== undefined) {
                this.position = data.position;
            }
        }

        if ("reactions" in data) {
            if (data.reactions === null) {
                this.reactions = undefined;
            } else if (data.reactions !== undefined) {
                this.reactions = data.reactions.map((reaction) => Reaction.from(reaction));
            }
        }

        if ("referenced_message" in data) {
            if (data.referenced_message === null) {
                this.referencedMessage = null;
            } else if (data.referenced_message !== undefined) {
                this.referencedMessage = Message.from(data.referenced_message);
            }
        }

        if ("resolved" in data) {
            if (data.resolved === null) {
                this.resolved = undefined;
            } else if (data.resolved !== undefined) {
                this.resolved = ResolvedData.from(data.resolved);
            }
        }

        if ("role_subscription_data" in data) {
            if (data.role_subscription_data === null) {
                this.roleSubscriptionData = undefined;
            } else if (data.role_subscription_data !== undefined) {
                this.roleSubscriptionData = RoleSubscriptionData.from(data.role_subscription_data);
            }
        }

        if ("sticker_items" in data) {
            if (data.sticker_items === null) {
                this.stickerItems = undefined;
            } else if (data.sticker_items !== undefined) {
                this.stickerItems = data.sticker_items.map((stickerItem) => StickerItem.from(stickerItem));
            }
        }

        if ("stickers" in data) {
            if (data.stickers === null) {
                this.stickers = undefined;
            } else if (data.stickers !== undefined) {
                this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
            }
        }

        if ("thread" in data) {
            if (data.thread === null) {
                this.thread = undefined;
            } else if (data.thread !== undefined) {
                this.thread = ThreadChannel.from(data.thread);
            }
        }

        if (data.timestamp !== undefined) {
            this.timestamp = data.timestamp;
        }

        if (data.tts !== undefined) {
            this.tts = data.tts;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("webhook_id" in data) {
            if (data.webhook_id === null) {
                this.webhookId = undefined;
            } else if (data.webhook_id !== undefined) {
                this.webhookId = data.webhook_id;
            }
        }
    }
}

export {
    type AllowedMentionTypes,
    MessageFlags,
    AttachmentFlags,
    MessageReferenceTypes,
    MessageActivityTypes,
    MessageTypes,
} from "@nyxjs/core";
