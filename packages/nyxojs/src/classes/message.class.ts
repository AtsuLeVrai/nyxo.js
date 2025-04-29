import {
  type ActionRowEntity,
  type AnyThreadChannelEntity,
  type ApplicationCommandInteractionMetadataEntity,
  type ApplicationEntity,
  type AttachmentEntity,
  BitField,
  type ChannelMentionEntity,
  type EmbedEntity,
  type GuildMemberEntity,
  type InteractionResolvedDataEntity,
  type MessageActivityEntity,
  type MessageCallEntity,
  type MessageComponentInteractionMetadataEntity,
  MessageFlags,
  type MessageInteractionEntity,
  type MessageReferenceEntity,
  MessageReferenceType,
  type MessageSnapshotEntity,
  MessageType,
  type ModalSubmitInteractionMetadataEntity,
  type PollEntity,
  type ReactionEntity,
  type RoleSubscriptionDataEntity,
  type Snowflake,
  link,
} from "@nyxojs/core";
import type { MessageCreateEntity } from "@nyxojs/gateway";
import type {
  CreateMessageSchema,
  EditMessageSchema,
  ReactionsFetchParams,
  ThreadFromMessageCreateOptions,
} from "@nyxojs/rest";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
  toSnakeCaseProperties,
} from "../utils/index.js";
import { Application } from "./application.class.js";
import type { AnyChannel, AnyThreadChannel } from "./channel.class.js";
import { GuildMember } from "./guild.class.js";
import { Sticker, StickerItem } from "./sticker.class.js";
import { User } from "./user.class.js";

/**
 * Represents a message in a Discord channel.
 *
 * The Message class serves as a comprehensive wrapper around Discord's message API, offering:
 * - Access to message content and metadata
 * - Methods to interact with messages (reply, edit, delete, etc.)
 * - Tools for managing reactions and attachments
 * - Access to embedded content, components, and references
 * - Utilities for working with threads and replies
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
@Cacheable("messages")
export class Message
  extends BaseClass<MessageCreateEntity>
  implements Enforce<CamelCasedProperties<MessageCreateEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this message.
   *
   * This ID is permanent and will not change for the lifetime of the message.
   * It can be used for API operations, referencing in replies, and persistent storage.
   *
   * @returns The message's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Gets the ID of the guild (server) where this message was sent.
   *
   * This property will be undefined for DM messages since they don't belong to any guild.
   *
   * @returns The guild ID, or undefined if the message was sent in a DM
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * Gets the GuildMember object for the author of this message in the context of the guild.
   *
   * This property provides additional information about the message author specific to the guild,
   * such as their nickname, roles, and join date. It will be undefined for DM messages or
   * when the member data is not available.
   *
   * @returns The GuildMember object, or undefined if not available
   */
  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return new GuildMember(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  /**
   * Gets the ID of the channel where this message was sent.
   *
   * This ID uniquely identifies the channel and can be used for API operations.
   *
   * @returns The channel's ID as a Snowflake string
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * Gets the User object for the author of this message.
   *
   * This provides information about the user who sent the message, such as
   * their username, discriminator, and avatar.
   *
   * @returns The User object for the message author
   */
  get author(): User {
    return new User(this.client, this.data.author);
  }

  /**
   * Gets the text content of the message.
   *
   * This is the actual textual content of the message, which may include
   * markdown formatting, mentions, emoji, etc.
   *
   * @returns The message content as a string
   */
  get content(): string {
    return this.data.content;
  }

  /**
   * Gets the timestamp when this message was sent.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message creation timestamp as a string
   */
  get timestamp(): string {
    return this.data.timestamp;
  }

  /**
   * Gets the timestamp when this message was last edited, or null if it was never edited.
   *
   * The timestamp is in ISO8601 format.
   *
   * @returns The message edit timestamp as a string, or null
   */
  get editedTimestamp(): string | null {
    return this.data.edited_timestamp;
  }

  /**
   * Checks if this message was sent as a text-to-speech message.
   *
   * TTS messages are read aloud to users in the channel who have text-to-speech enabled.
   *
   * @returns True if the message is TTS, false otherwise
   */
  get tts(): boolean {
    return Boolean(this.data.tts);
  }

  /**
   * Checks if this message mentions everyone in the channel.
   *
   * This will be true if the message contains @everyone or @here mentions.
   *
   * @returns True if the message mentions everyone, false otherwise
   */
  get mentionEveryone(): boolean {
    return Boolean(this.data.mention_everyone);
  }

  /**
   * Gets an array of users or guild members mentioned in this message.
   *
   * For guild messages, this may include GuildMember objects with additional
   * guild-specific information about the mentioned users.
   *
   * @returns An array of User or GuildMember objects, or undefined if none
   */
  get mentions(): (User | GuildMember)[] | undefined {
    return this.data.mentions?.map((mention) => {
      if ("id" in mention) {
        return new User(this.client, mention);
      }

      return new GuildMember(
        this.client,
        mention as GuildBased<GuildMemberEntity>,
      );
    });
  }

  /**
   * Gets an array of role IDs that were mentioned in this message.
   *
   * These are the IDs of roles that were mentioned using the @role syntax.
   *
   * @returns An array of role IDs
   */
  get mentionRoles(): Snowflake[] {
    return this.data.mention_roles;
  }

  /**
   * Gets an array of attachments included with this message.
   *
   * Attachments are files (images, documents, etc.) that are uploaded with a message.
   *
   * @returns An array of attachment objects
   */
  get attachments(): CamelCasedProperties<AttachmentEntity>[] {
    return this.data.attachments.map(toCamelCasedProperties);
  }

  /**
   * Gets an array of embeds included with this message.
   *
   * Embeds are rich content displays that can include formatted text, images,
   * and other media.
   *
   * @returns An array of embed objects
   */
  get embeds(): CamelCasedProperties<EmbedEntity>[] {
    return this.data.embeds.map(toCamelCasedProperties);
  }

  /**
   * Checks if this message is pinned in its channel.
   *
   * Pinned messages appear in the pinned messages list of the channel.
   *
   * @returns True if the message is pinned, false otherwise
   */
  get pinned(): boolean {
    return Boolean(this.data.pinned);
  }

  /**
   * Gets the type of this message.
   *
   * The message type determines how the message is displayed and what content it has.
   *
   * @returns The message type as a MessageType enum value
   */
  get type(): MessageType {
    return this.data.type;
  }

  /**
   * Gets an array of channels that were mentioned in this message.
   *
   * These are channels that were mentioned using the #channel syntax.
   *
   * @returns An array of channel mention objects, or undefined if none
   */
  get mentionChannels():
    | CamelCasedProperties<ChannelMentionEntity>[]
    | undefined {
    return this.data.mention_channels?.map(toCamelCasedProperties);
  }

  /**
   * Gets an array of reactions to this message.
   *
   * Reactions are emoji that users have added to the message as quick responses.
   *
   * @returns An array of reaction objects, or undefined if none
   */
  get reactions(): CamelCasedPropertiesDeep<ReactionEntity>[] | undefined {
    return this.data.reactions?.map(toCamelCasedPropertiesDeep);
  }

  /**
   * Gets the nonce of this message, which is a custom identifier used for validation.
   *
   * The nonce can be used to verify that a message was successfully sent.
   *
   * @returns The nonce as a string or number, or undefined if none
   */
  get nonce(): string | number | undefined {
    return this.data.nonce;
  }

  /**
   * Gets the webhook ID that sent this message, if it was sent by a webhook.
   *
   * @returns The webhook ID, or undefined if not sent by a webhook
   */
  get webhookId(): Snowflake | undefined {
    return this.data.webhook_id;
  }

  /**
   * Gets the activity associated with this message, if any.
   *
   * Activities are typically used with Rich Presence-related chat embeds.
   *
   * @returns The activity object, or undefined if none
   */
  get activity(): CamelCasedProperties<MessageActivityEntity> | undefined {
    return this.data.activity
      ? toCamelCasedProperties(this.data.activity)
      : undefined;
  }

  /**
   * Gets the application associated with this message, if any.
   *
   * This is typically present for Rich Presence-related messages.
   *
   * @returns The Application object, or undefined if none
   */
  get application(): Application | undefined {
    if (!this.data.application) {
      return undefined;
    }

    return new Application(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }

  /**
   * Gets the application ID associated with this message, if any.
   *
   * This is present for messages sent by interactions or application-owned webhooks.
   *
   * @returns The application ID, or undefined if none
   */
  get applicationId(): Snowflake | undefined {
    return this.data.application_id;
  }

  /**
   * Gets the flags associated with this message as a BitField.
   *
   * Message flags control various behaviors and display properties of the message.
   *
   * @returns A BitField of message flags
   */
  get flags(): BitField<MessageFlags> {
    return new BitField<MessageFlags>(this.data.flags ?? 0n);
  }

  /**
   * Gets the components (buttons, select menus, etc.) attached to this message.
   *
   * Components are interactive elements that users can interact with.
   *
   * @returns An array of action row components, or undefined if none
   */
  get components(): CamelCasedPropertiesDeep<ActionRowEntity>[] | undefined {
    return this.data.components?.map(toCamelCasedPropertiesDeep);
  }

  /**
   * Gets the sticker items attached to this message.
   *
   * Stickers are small, expressive images that users can attach to messages.
   *
   * @returns An array of StickerItem objects, or undefined if none
   */
  get stickerItems(): StickerItem[] | undefined {
    return this.data.sticker_items?.map(
      (stickerItem) => new StickerItem(this.client, stickerItem),
    );
  }

  /**
   * Gets the stickers attached to this message.
   *
   * @deprecated Use stickerItems instead.
   *
   * @returns An array of Sticker objects, or undefined if none
   */
  get stickers(): Sticker[] | undefined {
    return this.data.stickers?.map(
      (sticker) => new Sticker(this.client, sticker),
    );
  }

  /**
   * Gets the approximate position of this message in a thread.
   *
   * This is only meaningful for messages in threads.
   *
   * @returns The message position as a number, or undefined if not applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * Gets the role subscription data for this message, if it's a role subscription purchase event.
   *
   * This is only present for messages related to premium role subscriptions.
   *
   * @returns The role subscription data, or undefined if not applicable
   */
  get roleSubscriptionData():
    | CamelCasedProperties<RoleSubscriptionDataEntity>
    | undefined {
    if (!this.data.role_subscription_data) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.role_subscription_data);
  }

  /**
   * Gets the poll attached to this message, if any.
   *
   * Polls are interactive voting elements that users can participate in.
   *
   * @returns The poll object, or undefined if none
   */
  get poll(): CamelCasedPropertiesDeep<PollEntity> | undefined {
    if (!this.data.poll) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.poll);
  }

  /**
   * Gets the call information associated with this message, if it's a call message.
   *
   * This is only present for messages related to Discord calls.
   *
   * @returns The call object, or undefined if not applicable
   */
  get call(): CamelCasedProperties<MessageCallEntity> | undefined {
    if (!this.data.call) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.call);
  }

  /**
   * Gets the message reference for this message, if it's a reply or crosspost.
   *
   * The message reference contains information about the original message being referenced.
   *
   * @returns The message reference object, or undefined if not applicable
   */
  get messageReference():
    | CamelCasedProperties<MessageReferenceEntity>
    | undefined {
    if (!this.data.message_reference) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.message_reference);
  }

  /**
   * Gets the thread associated with this message, if it created a thread.
   *
   * This is only present for messages that have created threads.
   *
   * @returns The thread channel object, or undefined if not applicable
   */
  get thread(): AnyThreadChannel | undefined {
    if (!this.data.thread) {
      return undefined;
    }

    return ChannelFactory.createThread(
      this.client,
      this.data.thread as AnyThreadChannelEntity,
    );
  }

  /**
   * Gets the referenced message for this message, if it's a reply.
   *
   * This is the message being replied to. It can be null if the original message
   * was deleted, or undefined if this message is not a reply.
   *
   * @returns The referenced Message object, null if deleted, or undefined if not a reply
   */
  get referencedMessage(): Message | null | undefined {
    if (!this.data.referenced_message) {
      return null;
    }

    return new Message(
      this.client,
      this.data.referenced_message as MessageCreateEntity,
    );
  }

  /**
   * Gets the interaction that generated this message.
   *
   * @deprecated Use interactionMetadata instead.
   *
   * @returns The interaction object, or undefined if none
   */
  get interaction():
    | CamelCasedPropertiesDeep<MessageInteractionEntity>
    | undefined {
    if (!this.data.interaction) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.interaction);
  }

  /**
   * Gets the metadata about the interaction that generated this message.
   *
   * This property provides detailed information about application commands,
   * component interactions, or modal submissions that created this message.
   *
   * @returns The interaction metadata, or undefined if none
   */
  get interactionMetadata():
    | CamelCasedPropertiesDeep<ApplicationCommandInteractionMetadataEntity>
    | CamelCasedPropertiesDeep<MessageComponentInteractionMetadataEntity>
    | CamelCasedPropertiesDeep<ModalSubmitInteractionMetadataEntity>
    | undefined {
    if (!this.data.interaction_metadata) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.interaction_metadata);
  }

  /**
   * Gets the resolved data from the interaction that generated this message.
   *
   * Resolved data contains expanded objects like users, members, roles, and channels
   * that were referenced in the interaction.
   *
   * @returns The resolved data, or undefined if none
   */
  get resolved():
    | CamelCasedProperties<InteractionResolvedDataEntity>
    | undefined {
    if (!this.data.resolved) {
      return undefined;
    }

    return toCamelCasedProperties(this.data.resolved);
  }

  /**
   * Gets the message snapshots associated with this message, if it's a forwarded message.
   *
   * Message snapshots contain copies of messages at the time they were forwarded.
   *
   * @returns An array of message snapshots, or undefined if none
   */
  get messageSnapshots():
    | CamelCasedPropertiesDeep<MessageSnapshotEntity>[]
    | undefined {
    return this.data.message_snapshots?.map((snapshot) =>
      toCamelCasedPropertiesDeep(snapshot),
    );
  }

  /**
   * Gets the channel where this message was sent.
   *
   * This property lazily fetches the channel from the client cache or API.
   *
   * @returns A promise resolving to the channel object
   */
  get channel(): AnyChannel | undefined {
    return this.client.cache.channels.get(this.channelId);
  }

  /**
   * Gets the Date object for when this message was sent.
   *
   * @returns The Date when this message was created
   */
  get createdAt(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Gets the Date object for when this message was edited, or null if never edited.
   *
   * @returns The Date when this message was edited, or null
   */
  get editedAt(): Date | null {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this message was created.
   *
   * @returns The creation timestamp in milliseconds
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Checks if this message was sent by the client user.
   *
   * @returns True if the message author is the client user, false otherwise
   */
  get isAuthor(): boolean {
    return this.author.id === this.client.user.id;
  }

  /**
   * Checks if this message was sent by a webhook.
   *
   * @returns True if the message was sent by a webhook, false otherwise
   */
  get isWebhook(): boolean {
    return this.webhookId !== undefined;
  }

  /**
   * Checks if this message is a system message.
   *
   * System messages are messages generated by Discord rather than users,
   * such as join messages, pin notifications, etc.
   *
   * @returns True if the message is a system message, false otherwise
   */
  get isSystem(): boolean {
    return this.type !== MessageType.Default && this.type !== MessageType.Reply;
  }

  /**
   * Checks if this message is a reply to another message.
   *
   * @returns True if the message is a reply, false otherwise
   */
  get isReply(): boolean {
    return this.type === MessageType.Reply || Boolean(this.messageReference);
  }

  /**
   * Checks if this message is a partial message.
   *
   * Partial messages may not have all properties available.
   *
   * @returns True if the message is partial, false otherwise
   */
  get isPartial(): boolean {
    return !this.content;
  }

  /**
   * Checks if this message is crossposted (published to subscriber channels).
   *
   * @returns True if the message is crossposted, false otherwise
   */
  get isCrossposted(): boolean {
    return this.flags.has(MessageFlags.Crossposted);
  }

  /**
   * Checks if this message has a thread associated with it.
   *
   * @returns True if the message has created a thread, false otherwise
   */
  get hasThread(): boolean {
    return this.flags.has(MessageFlags.HasThread) || Boolean(this.thread);
  }

  /**
   * Checks if this message is ephemeral (only visible to the interaction user).
   *
   * @returns True if the message is ephemeral, false otherwise
   */
  get isEphemeral(): boolean {
    return this.flags.has(MessageFlags.Ephemeral);
  }

  /**
   * Checks if this message is from an interaction.
   *
   * @returns True if the message is from an interaction, false otherwise
   */
  get isInteraction(): boolean {
    return (
      Boolean(this.data.interaction) || Boolean(this.data.interaction_metadata)
    );
  }

  /**
   * Gets the URL to this message.
   *
   * The URL can be used to link directly to this message in a web browser.
   *
   * @returns The URL to this message
   */
  get url(): string {
    return `https://discord.com/channels/${this.guildId ?? "@me"}/${this.channelId}/${this.id}`;
  }

  /**
   * Gets the age of this message in milliseconds (time since creation).
   *
   * @returns The age in milliseconds
   */
  get age(): number {
    return Date.now() - this.createdTimestamp;
  }

  /**
   * Replies to this message.
   *
   * This method creates a new message that references this message as a reply.
   *
   * @param options - The content or options for the reply
   * @returns A promise resolving to the sent reply message
   * @throws Error if the message could not be sent
   */
  async reply(
    options: string | Omit<CreateMessageSchema, "message_reference">,
  ): Promise<Message> {
    let message = options as CreateMessageSchema;
    if (typeof options === "string") {
      message = { content: options };
    }

    const reply = await this.client.rest.messages.sendMessage(this.channelId, {
      ...message,
      message_reference: {
        message_id: this.id,
        channel_id: this.channelId,
        guild_id: this.guildId ?? undefined,
        type: MessageReferenceType.Default,
      },
    });

    return new Message(this.client, reply as MessageCreateEntity);
  }

  /**
   * Edits this message.
   *
   * This method can only edit messages sent by the client user.
   *
   * @param options - The new content or options for the message
   * @returns A promise resolving to the edited message
   * @throws Error if the message could not be edited or wasn't sent by the client
   */
  async edit(options: string | EditMessageSchema): Promise<Message> {
    if (!this.isAuthor) {
      throw new Error("Cannot edit messages sent by other users");
    }

    let data = options as EditMessageSchema;
    if (typeof options === "string") {
      data = { content: options };
    }

    const editedMessage = await this.client.rest.messages.updateMessage(
      this.channelId,
      this.id,
      toSnakeCaseProperties(data),
    );

    return new Message(this.client, editedMessage as MessageCreateEntity);
  }

  /**
   * Deletes this message.
   *
   * This method can delete messages sent by the client user, or other messages
   * if the client has the MANAGE_MESSAGES permission.
   *
   * @param reason - The reason for deleting the message (for audit logs)
   * @returns A promise that resolves when the message is deleted
   * @throws Error if the message could not be deleted due to permissions or other issues
   */
  deleteMessage(reason?: string): Promise<void> {
    return this.client.rest.messages.deleteMessage(
      this.channelId,
      this.id,
      reason,
    );
  }

  /**
   * Pins this message to its channel.
   *
   * Pinned messages appear in the channel's pinned messages list.
   *
   * @returns A promise that resolves when the message is pinned
   * @throws Error if the message could not be pinned
   */
  async pin(): Promise<void> {
    if (this.pinned) {
      return;
    }
    await this.client.rest.channels.pinMessage(this.channelId, this.id);
    return;
  }

  /**
   * Unpins this message from its channel.
   *
   * @returns A promise that resolves when the message is unpinned
   * @throws Error if the message could not be unpinned
   */
  async unpin(): Promise<void> {
    if (!this.pinned) {
      return;
    }
    await this.client.rest.channels.unpinMessage(this.channelId, this.id);
    return;
  }

  /**
   * Creates a thread from this message.
   *
   * This will create a new thread with this message as the starter message.
   *
   * @param options - The options for the thread, including name and auto-archive duration
   * @param reason - The reason for creating the thread (for audit logs)
   * @returns A promise resolving to the created thread
   * @throws Error if the thread could not be created
   */
  async startThread(
    options: CamelCasedProperties<ThreadFromMessageCreateOptions>,
    reason?: string,
  ): Promise<AnyThreadChannel> {
    const thread = await this.client.rest.channels.createThreadFromMessage(
      this.channelId,
      this.id,
      toSnakeCaseProperties(options),
      reason,
    );

    return ChannelFactory.createThread(
      this.client,
      thread as AnyThreadChannelEntity,
    );
  }

  /**
   * Reacts to this message with an emoji.
   *
   * @param emoji - The emoji to react with (Unicode emoji or custom emoji in name:id format)
   * @returns A promise that resolves when the reaction is added
   * @throws Error if the reaction could not be added
   */
  react(emoji: string): Promise<void> {
    return this.client.rest.messages.addReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes the client user's reaction from this message.
   *
   * @param emoji - The emoji to remove reaction for
   * @returns A promise that resolves when the reaction is removed
   * @throws Error if the reaction could not be removed
   */
  removeReaction(emoji: string): Promise<void> {
    return this.client.rest.messages.removeOwnReaction(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes a specific user's reaction from this message.
   *
   * @param emoji - The emoji to remove reaction for
   * @param userId - The ID of the user whose reaction to remove
   * @returns A promise that resolves when the reaction is removed
   * @throws Error if the reaction could not be removed
   */
  removeUserReaction(emoji: string, userId: Snowflake): Promise<void> {
    return this.client.rest.messages.removeUserReaction(
      this.channelId,
      this.id,
      emoji,
      userId,
    );
  }

  /**
   * Removes all reactions of a specific emoji from this message.
   *
   * @param emoji - The emoji to remove all reactions for
   * @returns A promise that resolves when the reactions are removed
   * @throws Error if the reactions could not be removed
   */
  removeAllReactionsForEmoji(emoji: string): Promise<void> {
    return this.client.rest.messages.removeEmojiReactions(
      this.channelId,
      this.id,
      emoji,
    );
  }

  /**
   * Removes all reactions from this message.
   *
   * @returns A promise that resolves when all reactions are removed
   * @throws Error if the reactions could not be removed
   */
  removeAllReactions(): Promise<void> {
    return this.client.rest.messages.removeAllReactions(
      this.channelId,
      this.id,
    );
  }

  /**
   * Fetches users who reacted to this message with a specific emoji.
   *
   * @param emoji - The emoji to get reactions for
   * @param options - Options for pagination and reaction type filtering
   * @returns A promise resolving to an array of user objects
   * @throws Error if the reaction users could not be fetched
   */
  async fetchReactionUsers(
    emoji: string,
    options?: ReactionsFetchParams,
  ): Promise<User[]> {
    const users = await this.client.rest.messages.fetchReactionUsers(
      this.channelId,
      this.id,
      emoji,
      options,
    );

    return users.map((user) => new User(this.client, user));
  }

  /**
   * Fetches this message from the API to get the most current data.
   *
   * This is useful when you need to ensure you have the latest version of the message.
   *
   * @returns A promise resolving to the refreshed message
   * @throws Error if the message could not be fetched
   */
  async fetch(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, messageData as MessageCreateEntity);
  }

  /**
   * Crossposts (publishes) this message to all channels following the channel.
   *
   * This only works in announcement channels.
   *
   * @returns A promise resolving to the crossposted message
   * @throws Error if the message could not be crossposted
   */
  async crosspost(): Promise<Message> {
    const publishedMessage = await this.client.rest.messages.crosspostMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, publishedMessage as MessageCreateEntity);
  }

  /**
   * Suppresses or unsuppresses embeds in this message.
   *
   * @param suppress - Whether to suppress embeds (true) or unsuppress them (false)
   * @returns A promise resolving to the updated message
   * @throws Error if the embeds could not be suppressed
   */
  suppressEmbeds(suppress = true): Promise<Message> {
    const flags = new BitField<MessageFlags>(this.flags.valueOf());

    if (suppress) {
      flags.add(MessageFlags.SuppressEmbeds);
    } else {
      flags.remove(MessageFlags.SuppressEmbeds);
    }

    return this.edit({
      flags: Number(flags.valueOf()) as MessageFlags,
    });
  }

  /**
   * Creates a formatted link to this message.
   *
   * @param text - The display text for the link
   * @returns The formatted markdown link
   */
  createMessageLink(text: string): string {
    return link(text, this.url);
  }
}
