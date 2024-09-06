import type {
    AllowedMentionsStructure,
    AllowedMentionTypes,
    AttachmentStructure,
    ChannelMentionStructure,
    ChannelTypes,
    EmbedAuthorStructure,
    EmbedFieldStructure,
    EmbedFooterStructure,
    EmbedImageStructure,
    EmbedProviderStructure,
    EmbedStructure,
    EmbedThumbnailStructure,
    EmbedTypes,
    EmbedVideoStructure,
    InteractionTypes,
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
} from "@nyxjs/api-types";
import type { DiscordHeaders, Float, Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import { Application } from "./Applications";
import { Base } from "./Base";
import { ThreadChannel } from "./Channels";
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

    public constructor(data: Partial<RoleSubscriptionDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<RoleSubscriptionDataStructure>): void {
        this.isRenewal = data.is_renewal ?? this.isRenewal;
        this.roleSubscriptionListingId = data.role_subscription_listing_id ?? this.roleSubscriptionListingId;
        this.tierName = data.tier_name ?? this.tierName;
        this.totalMonthsSubscribed = data.total_months_subscribed ?? this.totalMonthsSubscribed;
    }
}

export class AllowedMentions extends Base<AllowedMentionsStructure> {
    public parse!: AllowedMentionTypes[];

    public repliedUser!: boolean;

    public roles!: Snowflake[];

    public users!: Snowflake[];

    public constructor(data: Partial<AllowedMentionsStructure>) {
        super(data);
    }

    protected patch(data: Partial<AllowedMentionsStructure>): void {
        this.parse = data.parse ?? this.parse;
        this.repliedUser = data.replied_user ?? this.repliedUser;
        this.roles = data.roles ?? this.roles;
        this.users = data.users ?? this.users;
    }
}

export class ChannelMention extends Base<ChannelMentionStructure> {
    public guildId!: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public type!: ChannelTypes;

    public constructor(data: Partial<ChannelMentionStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelMentionStructure>): void {
        this.guildId = data.guild_id ?? this.guildId;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.type = data.type ?? this.type;
    }
}

export class Attachment extends Base<AttachmentStructure> {
    public contentType?: DiscordHeaders["Content-Type"];

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

    public constructor(data: Partial<AttachmentStructure>) {
        super(data);
    }

    protected patch(data: Partial<AttachmentStructure>): void {
        if ("content_type" in data) {
            this.contentType = data.content_type;
        }

        if ("description" in data) {
            this.description = data.description;
        }

        if ("duration_secs" in data) {
            this.durationSecs = data.duration_secs;
        }

        if ("ephemeral" in data) {
            this.ephemeral = data.ephemeral;
        }

        this.filename = data.filename ?? this.filename;

        if ("flags" in data) {
            this.flags = data.flags;
        }

        if ("height" in data) {
            this.height = data.height;
        }

        this.id = data.id ?? this.id;
        this.proxyUrl = data.proxy_url ?? this.proxyUrl;
        this.size = data.size ?? this.size;

        if ("title" in data) {
            this.title = data.title;
        }

        this.url = data.url ?? this.url;

        if ("waveform" in data) {
            this.waveform = data.waveform;
        }

        if ("width" in data) {
            this.width = data.width;
        }
    }
}

export class EmbedField extends Base<EmbedFieldStructure> {
    public inline?: boolean;

    public name!: string;

    public value!: string;

    public constructor(data: Partial<EmbedFieldStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedFieldStructure>): void {
        if ("inline" in data) {
            this.inline = data.inline;
        }

        this.name = data.name ?? this.name;
        this.value = data.value ?? this.value;
    }
}

export class EmbedFooter extends Base<EmbedFooterStructure> {
    public iconUrl?: string;

    public proxyIconUrl?: string;

    public text!: string;

    public constructor(data: Partial<EmbedFooterStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedFooterStructure>): void {
        if ("icon_url" in data) {
            this.iconUrl = data.icon_url;
        }

        if ("proxy_icon_url" in data) {
            this.proxyIconUrl = data.proxy_icon_url;
        }

        this.text = data.text ?? this.text;
    }
}

export class EmbedAuthor extends Base<EmbedAuthorStructure> {
    public iconUrl?: string;

    public name!: string;

    public proxyIconUrl?: string;

    public url?: string;

    public constructor(data: Partial<EmbedAuthorStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedAuthorStructure>): void {
        if ("icon_url" in data) {
            this.iconUrl = data.icon_url;
        }

        this.name = data.name ?? this.name;

        if ("proxy_icon_url" in data) {
            this.proxyIconUrl = data.proxy_icon_url;
        }

        if ("url" in data) {
            this.url = data.url;
        }
    }
}

export class EmbedProvider extends Base<EmbedProviderStructure> {
    public name?: string;

    public url?: string;

    public constructor(data: Partial<EmbedProviderStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedProviderStructure>): void {
        if ("name" in data) {
            this.name = data.name;
        }

        if ("url" in data) {
            this.url = data.url;
        }
    }
}

export class EmbedImage extends Base<EmbedImageStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Partial<EmbedImageStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedImageStructure>): void {
        if ("height" in data) {
            this.height = data.height;
        }

        if ("proxy_url" in data) {
            this.proxyUrl = data.proxy_url;
        }

        this.url = data.url ?? this.url;

        if ("width" in data) {
            this.width = data.width;
        }
    }
}

export class EmbedVideo extends Base<EmbedVideoStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Partial<EmbedVideoStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedVideoStructure>): void {
        if ("height" in data) {
            this.height = data.height;
        }

        if ("proxy_url" in data) {
            this.proxyUrl = data.proxy_url;
        }

        this.url = data.url ?? this.url;

        if ("width" in data) {
            this.width = data.width;
        }
    }
}

export class EmbedThumbnail extends Base<EmbedThumbnailStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Partial<EmbedThumbnailStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedThumbnailStructure>): void {
        if ("height" in data) {
            this.height = data.height;
        }

        if ("proxy_url" in data) {
            this.proxyUrl = data.proxy_url;
        }

        this.url = data.url ?? this.url;

        if ("width" in data) {
            this.width = data.width;
        }
    }
}

export class Embed extends Base<EmbedStructure> {
    public author?: EmbedAuthor;

    public color?: Integer;

    public description?: string;

    public fields?: EmbedField[];

    public footer?: EmbedFooter;

    public image?: EmbedImage;

    public provider?: EmbedProvider;

    public thumbnail?: EmbedThumbnail;

    public timestamp?: IsoO8601Timestamp;

    public title?: string;

    public type?: EmbedTypes;

    public url?: string;

    public video?: EmbedVideo;

    public constructor(data: Partial<EmbedStructure>) {
        super(data);
    }

    protected patch(data: Partial<EmbedStructure>): void {
        if ("author" in data && data.author) {
            this.author = EmbedAuthor.from(data.author);
        }

        if ("color" in data) {
            this.color = data.color;
        }

        if ("description" in data) {
            this.description = data.description;
        }

        if ("fields" in data && data.fields) {
            this.fields = data.fields.map((field) => EmbedField.from(field));
        }

        if ("footer" in data && data.footer) {
            this.footer = EmbedFooter.from(data.footer);
        }

        if ("image" in data && data.image) {
            this.image = EmbedImage.from(data.image);
        }

        if ("provider" in data && data.provider) {
            this.provider = EmbedProvider.from(data.provider);
        }

        if ("thumbnail" in data && data.thumbnail) {
            this.thumbnail = EmbedThumbnail.from(data.thumbnail);
        }

        if ("timestamp" in data) {
            this.timestamp = data.timestamp;
        }

        if ("title" in data) {
            this.title = data.title;
        }

        if ("type" in data) {
            this.type = data.type;
        }

        if ("url" in data) {
            this.url = data.url;
        }

        if ("video" in data && data.video) {
            this.video = EmbedVideo.from(data.video);
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

    public emoji!: Pick<Emoji, "animated" | "id" | "name">;

    public me!: boolean;

    public meBurst!: boolean;

    public constructor(data: Partial<ReactionStructure>) {
        super(data);
    }

    protected patch(data: Partial<ReactionStructure>): void {
        this.burstColors = data.burst_colors ?? this.burstColors;
        this.count = data.count ?? this.count;
        this.countDetails = data.count_details ? ReactionCountDetails.from(data.count_details) : this.countDetails;
        this.emoji = data.emoji ? Emoji.from(data.emoji) : this.emoji;
        this.me = data.me ?? this.me;
        this.meBurst = data.me_burst ?? this.meBurst;
    }
}

export class MessageReference extends Base<MessageReferenceStructure> {
    public channelId?: Snowflake;

    public failIfNotExists?: boolean;

    public guildId?: Snowflake;

    public messageId?: Snowflake;

    public type?: MessageReferenceTypes;

    public constructor(data: Partial<MessageReferenceStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageReferenceStructure>): void {
        if ("channel_id" in data) {
            this.channelId = data.channel_id;
        }

        if ("fail_if_not_exists" in data) {
            this.failIfNotExists = data.fail_if_not_exists;
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        if ("message_id" in data) {
            this.messageId = data.message_id;
        }

        if ("type" in data) {
            this.type = data.type;
        }
    }
}

export class MessageCall extends Base<MessageCallStructure> {
    public endedTimestamp?: IsoO8601Timestamp | null;

    public participants!: Snowflake[];

    public constructor(data: Partial<MessageCallStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageCallStructure>): void {
        if ("ended_timestamp" in data) {
            this.endedTimestamp = data.ended_timestamp;
        }

        this.participants = data.participants ?? this.participants;
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

    public constructor(data: Partial<MessageInteractionMetadataStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageInteractionMetadataStructure>): void {
        this.authorizingIntegrationOwners = data.authorizing_integration_owners ?? this.authorizingIntegrationOwners;
        this.id = data.id ?? this.id;

        if ("interacted_message_id" in data) {
            this.interactedMessageId = data.interacted_message_id;
        }

        if ("original_response_message_id" in data) {
            this.originalResponseMessageId = data.original_response_message_id;
        }

        this.triggeringInteractionMetadata = data.triggering_interaction_metadata
            ? MessageInteractionMetadata.from(data.triggering_interaction_metadata)
            : this.triggeringInteractionMetadata;
        this.type = data.type ?? this.type;
        this.user = data.user ? User.from(data.user) : this.user;
    }
}

export class MessageActivity extends Base<MessageActivityStructure> {
    public partyId?: string;

    public type!: MessageActivityTypes;

    public constructor(data: Partial<MessageActivityStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageActivityStructure>): void {
        if ("party_id" in data) {
            this.partyId = data.party_id;
        }

        this.type = data.type ?? this.type;
    }
}

export class MessageSnapshot extends Base<MessageSnapshotStructure> {
    public message!: Pick<
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

    public constructor(data: Partial<MessageSnapshotStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageSnapshotStructure>): void {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.message = data.message ? Message.from(data.message) : this.message;
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

    public constructor(data: Partial<MessageStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageStructure>): void {
        if ("activity" in data) {
            this.activity = data.activity ? MessageActivity.from(data.activity) : undefined;
        }

        if ("application" in data && data.application) {
            this.application = Application.from(data.application);
        }

        if ("application_id" in data) {
            this.applicationId = data.application_id;
        }

        if ("attachments" in data) {
            this.attachments = data.attachments?.map((attachment) => Attachment.from(attachment)) ?? this.attachments;
        }

        if ("author" in data && data.author) {
            this.author = User.from(data.author);
        }

        if ("call" in data) {
            this.call = data.call ? MessageCall.from(data.call) : undefined;
        }

        this.channelId = data.channel_id ?? this.channelId;

        if ("components" in data) {
            this.components = data.components?.map((component) => ActionRow.from(component));
        }

        this.content = data.content ?? this.content;
        this.editedTimestamp = data.edited_timestamp ?? this.editedTimestamp;

        if ("embeds" in data) {
            this.embeds = data.embeds?.map((embed) => Embed.from(embed)) ?? this.embeds;
        }

        if ("flags" in data) {
            this.flags = data.flags;
        }

        this.id = data.id ?? this.id;

        if ("interaction" in data) {
            this.interaction = data.interaction ? MessageInteractionMetadata.from(data.interaction) : undefined;
        }

        if ("interaction_metadata" in data) {
            this.interactionMetadata = data.interaction_metadata
                ? MessageInteraction.from(data.interaction_metadata)
                : undefined;
        }

        if ("mention_channels" in data) {
            this.mentionChannels = data.mention_channels?.map((channel) => ChannelMention.from(channel));
        }

        this.mentionEveryone = data.mention_everyone ?? this.mentionEveryone;
        this.mentionRoles = data.mention_roles ?? this.mentionRoles;

        if ("mentions" in data) {
            this.mentions = data.mentions?.map((user) => User.from(user)) ?? this.mentions;
        }

        if ("message_reference" in data) {
            this.messageReference = data.message_reference ? MessageReference.from(data.message_reference) : undefined;
        }

        if ("message_snapshots" in data) {
            this.messageSnapshots = data.message_snapshots?.map((snapshot) => MessageSnapshot.from(snapshot));
        }

        this.nonce = data.nonce ?? this.nonce;
        this.pinned = data.pinned ?? this.pinned;

        if ("poll" in data) {
            this.poll = data.poll ? Poll.from(data.poll) : undefined;
        }

        this.position = data.position ?? this.position;

        if ("reactions" in data) {
            this.reactions = data.reactions?.map((reaction) => Reaction.from(reaction));
        }

        if ("referenced_message" in data) {
            this.referencedMessage = data.referenced_message ? Message.from(data.referenced_message) : null;
        }

        if ("resolved" in data) {
            this.resolved = data.resolved ? ResolvedData.from(data.resolved) : undefined;
        }

        if ("role_subscription_data" in data) {
            this.roleSubscriptionData = data.role_subscription_data
                ? RoleSubscriptionData.from(data.role_subscription_data)
                : undefined;
        }

        if ("sticker_items" in data) {
            this.stickerItems = data.sticker_items?.map((item) => StickerItem.from(item));
        }

        if ("stickers" in data) {
            this.stickers = data.stickers?.map((sticker) => Sticker.from(sticker));
        }

        if ("thread" in data) {
            this.thread = data.thread ? ThreadChannel.from(data.thread) : undefined;
        }

        this.timestamp = data.timestamp ?? this.timestamp;
        this.tts = data.tts ?? this.tts;
        this.type = data.type ?? this.type;
        this.webhookId = data.webhook_id ?? this.webhookId;
    }
}

export {
    type AllowedMentionTypes,
    MessageFlags,
    AttachmentFlags,
    type EmbedTypes,
    MessageReferenceTypes,
    MessageActivityTypes,
    MessageTypes,
} from "@nyxjs/api-types";
