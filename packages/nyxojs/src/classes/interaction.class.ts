import {
  type ActionRowEntity,
  type AnyChannelEntity,
  type AnyInteractionCommandOptionEntity,
  type AnySimpleInteractionCommandOptionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type ApplicationIntegrationType,
  type AttachmentEntity,
  ComponentType,
  type GuildEntity,
  type GuildMemberEntity,
  type InteractionCallbackAutocompleteEntity,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  type InteractionCallbackResponseEntity,
  InteractionCallbackType,
  InteractionContextType,
  type InteractionDataEntity,
  type InteractionEntity,
  type InteractionResolvedDataEntity,
  type InteractionResponseEntity,
  InteractionType,
  type Locale,
  type MessageComponentInteractionDataEntity,
  type MessageEntity,
  MessageFlags,
  type ModalSubmitInteractionDataEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type SubCommandGroupInteractionOptionEntity,
  type SubCommandInteractionOptionEntity,
} from "@nyxojs/core";
import type {
  WebhookExecuteOptions,
  WebhookMessageEditOptions,
} from "@nyxojs/rest";
import { BaseClass } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import type { AnyChannel } from "./channel.class.js";
import { Entitlement } from "./entitlement.class.js";
import { Guild, GuildMember } from "./guild.class.js";
import { Message } from "./message.class.js";
import { Role } from "./role.class.js";
import { User } from "./user.class.js";

/**
 * Base class representing a Discord interaction.
 *
 * The Interaction class provides a foundation for all types of interactions (commands, components, autocomplete, etc.),
 * with methods for responding to interactions and accessing related entities.
 *
 * Interactions are events sent when a user interacts with an application through commands,
 * message components (buttons, select menus), or other interactive elements.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object}
 */
export class Interaction
  extends BaseClass<InteractionEntity>
  implements Enforce<PropsToCamel<InteractionEntity>>
{
  /**
   * Cached user instance who triggered this interaction.
   * @internal
   */
  #user: User | null = null;

  /**
   * Cached guild member instance for this interaction.
   * @internal
   */
  #member: GuildMember | null = null;

  /**
   * Cached channel instance where this interaction occurred.
   * @internal
   */
  #channel: AnyChannel | null = null;

  /**
   * Cached guild instance where this interaction occurred.
   * @internal
   */
  #guild: Guild | null = null;

  /**
   * Cached message instance that this interaction is associated with.
   * @internal
   */
  #message: Message | null = null;

  /**
   * Gets the unique ID of this interaction.
   *
   * This ID can be used to identify and reference this specific interaction event.
   *
   * @returns The interaction's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the ID of the application this interaction is for.
   *
   * This identifies which application owns the command or component
   * that triggered the interaction.
   *
   * @returns The application ID as a Snowflake string
   */
  get applicationId(): Snowflake {
    return this.rawData.application_id;
  }

  /**
   * Gets the type of this interaction.
   *
   * This determines what kind of interaction this is (command, component, etc.)
   * and affects what properties and methods are available.
   *
   * @returns The interaction type as an enum value
   */
  get type(): InteractionType {
    return this.rawData.type;
  }

  /**
   * Gets the interaction data payload.
   *
   * This contains type-specific information about the interaction,
   * with different properties based on the interaction type.
   *
   * @returns The interaction data, or undefined if not present
   */
  get data(): InteractionDataEntity | undefined {
    return this.rawData.data;
  }

  /**
   * Gets the ID of the guild where this interaction was triggered.
   *
   * This may be undefined for interactions in direct messages.
   *
   * @returns The guild ID as a Snowflake string, or undefined if in DMs
   */
  get guildId(): Snowflake | undefined {
    return this.rawData.guild_id;
  }

  /**
   * Gets the ID of the channel where this interaction was triggered.
   *
   * This may be undefined in rare cases where the interaction
   * doesn't have a channel context.
   *
   * @returns The channel ID as a Snowflake string, or undefined if not available
   */
  get channelId(): Snowflake | undefined {
    return this.rawData.channel_id;
  }

  /**
   * Gets the token for this interaction.
   *
   * This token is used for authorization when responding to the interaction.
   * It must be kept secret and securely stored.
   *
   * @returns The interaction token string
   */
  get token(): string {
    return this.rawData.token;
  }

  /**
   * Gets the user who triggered this interaction.
   *
   * For interactions in guilds, this is extracted from the member object.
   * For DM interactions, this comes from the user field.
   *
   * @returns The user entity in camelCase format, or undefined if not available
   */
  get user(): User | undefined {
    if (this.rawData.user) {
      return new User(this.client, this.rawData.user);
    }

    if (this.rawData.member?.user) {
      return new User(this.client, this.rawData.member.user);
    }

    return undefined;
  }

  /**
   * Gets the guild member object for the user who triggered this interaction.
   *
   * This is only available for interactions that occur in guilds.
   *
   * @returns The guild member entity in camelCase format, or undefined if not in a guild
   */
  get member(): GuildMember | undefined {
    return this.rawData.member
      ? new GuildMember(this.client, {
          ...this.rawData.member,
          guild_id: this.guildId as Snowflake,
        })
      : undefined;
  }

  /**
   * Gets the channel where this interaction was triggered.
   *
   * This may be undefined if the interaction doesn't have channel data.
   *
   * @returns The partial channel entity in camelCase format, or undefined if not available
   */
  get channel(): AnyChannel | undefined {
    return this.rawData.channel
      ? channelFactory(this.client, this.rawData.channel as AnyChannelEntity)
      : undefined;
  }

  /**
   * Gets the guild where this interaction was triggered.
   *
   * This may be undefined for interactions in direct messages or
   * if the guild data isn't included.
   *
   * @returns The partial guild entity in camelCase format, or undefined if not available
   */
  get guild(): Guild | undefined {
    return this.rawData.guild
      ? new Guild(this.client, this.rawData.guild as GuildEntity)
      : undefined;
  }

  /**
   * Gets the message that this interaction is associated with.
   *
   * This is provided for component interactions that are attached to messages,
   * like button clicks or select menu interactions.
   *
   * @returns The message entity in camelCase format, or undefined if not a component interaction
   */
  get message(): Message | undefined {
    return this.rawData.message
      ? new Message(this.client, this.rawData.message)
      : undefined;
  }

  /**
   * Gets the permissions that the application has in the interaction's context.
   *
   * This is a bitwise string representing the application's permissions.
   *
   * @returns The permission bitfield as a string
   */
  get appPermissions(): string {
    return this.rawData.app_permissions;
  }

  /**
   * Gets the locale of the user who triggered the interaction.
   *
   * This represents the language setting of the user.
   *
   * @returns The user's locale, or undefined if not available
   */
  get locale(): Locale | undefined {
    return this.rawData.locale;
  }

  /**
   * Gets the preferred locale of the guild where the interaction occurred.
   *
   * This represents the language setting of the guild.
   *
   * @returns The guild's locale, or undefined if not in a guild or not available
   */
  get guildLocale(): Locale | undefined {
    return this.rawData.guild_locale;
  }

  /**
   * Gets the entitlements that the user has for the application.
   *
   * This is relevant for monetized applications.
   *
   * @returns An array of entitlement entities in camelCase format
   */
  get entitlements(): Entitlement[] {
    return this.rawData.entitlements.map(
      (entitlement) => new Entitlement(this.client, entitlement),
    );
  }

  /**
   * Gets information about which installations authorized this interaction.
   *
   * This maps integration types to owner IDs.
   *
   * @returns A record mapping integration types to owner IDs
   */
  get authorizingIntegrationOwners(): Record<
    ApplicationIntegrationType,
    Snowflake | "0"
  > {
    return this.rawData.authorizing_integration_owners;
  }

  /**
   * Gets the context where this interaction was triggered from.
   *
   * This indicates the environment where the interaction occurred
   * (guild, DM, etc.).
   *
   * @returns The interaction context type, or undefined if not specified
   */
  get context(): InteractionContextType | undefined {
    return this.rawData.context;
  }

  /**
   * Gets the version of the interaction.
   *
   * This is always 1 for the current version of the interaction API.
   *
   * @returns The interaction version as a number
   */
  get version(): 1 {
    return this.rawData.version;
  }

  /**
   * Checks if this interaction has a guild context.
   *
   * @returns True if the interaction occurred in a guild, false otherwise
   */
  get isInGuild(): boolean {
    return this.guildId !== undefined;
  }

  /**
   * Checks if this interaction was triggered in a direct message.
   *
   * @returns True if the interaction occurred in a DM, false otherwise
   */
  get isInDm(): boolean {
    return (
      !this.isInGuild &&
      this.context !== undefined &&
      (this.context === InteractionContextType.BotDm ||
        this.context === InteractionContextType.PrivateChannel)
    );
  }

  /**
   * Checks if this interaction is a ping interaction.
   *
   * Ping interactions are sent during the initial webhook handshake process.
   *
   * @returns True if this is a ping interaction, false otherwise
   */
  get isPing(): boolean {
    return this.type === InteractionType.Ping;
  }

  /**
   * Checks if this interaction is an application command interaction.
   *
   * Application command interactions are triggered when a user uses a slash command,
   * a user command, or a message command.
   *
   * @returns True if this is an application command interaction, false otherwise
   */
  get isCommand(): boolean {
    return this.type === InteractionType.ApplicationCommand;
  }

  /**
   * Checks if this interaction is a message component interaction.
   *
   * Message component interactions are triggered when a user interacts with
   * a button, select menu, or other component attached to a message.
   *
   * @returns True if this is a message component interaction, false otherwise
   */
  get isMessageComponent(): boolean {
    return this.type === InteractionType.MessageComponent;
  }

  /**
   * Checks if this interaction is an autocomplete interaction.
   *
   * Autocomplete interactions are triggered when a user is typing in a command
   * option that has autocomplete enabled.
   *
   * @returns True if this is an autocomplete interaction, false otherwise
   */
  get isAutocomplete(): boolean {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  /**
   * Checks if this interaction is a modal submit interaction.
   *
   * Modal submit interactions are triggered when a user submits a modal form.
   *
   * @returns True if this is a modal submit interaction, false otherwise
   */
  get isModalSubmit(): boolean {
    return this.type === InteractionType.ModalSubmit;
  }

  /**
   * Fetches the User instance for the user who triggered this interaction.
   *
   * This method lazily loads and caches the User object.
   *
   * @returns A promise resolving to the User instance
   * @throws Error if the user data is not available
   */
  async fetchUser(): Promise<User> {
    if (this.#user) {
      return this.#user;
    }

    if (!this.user) {
      throw new Error("User data not available for this interaction");
    }

    try {
      const userId = this.user.id as Snowflake;
      const user = await this.client.rest.users.fetchUser(userId);
      return new User(this.client, user);
    } catch (error) {
      throw new Error(`Failed to fetch user for interaction: ${error}`);
    }
  }

  /**
   * Fetches the GuildMember instance for the user who triggered this interaction.
   *
   * This method lazily loads and caches the GuildMember object.
   *
   * @returns A promise resolving to the GuildMember instance
   * @throws Error if the interaction is not in a guild or member data is not available
   */
  async fetchMember(): Promise<GuildMember> {
    if (!this.isInGuild) {
      throw new Error("Interaction is not in a guild");
    }

    if (this.#member) {
      return this.#member;
    }

    try {
      const user = await this.fetchUser();
      this.#member = await user.fetchGuildMember(this.guildId as Snowflake);
      return this.#member;
    } catch (error) {
      throw new Error(`Failed to fetch guild member for interaction: ${error}`);
    }
  }

  /**
   * Fetches the Channel instance where this interaction was triggered.
   *
   * This method lazily loads and caches the Channel object.
   *
   * @returns A promise resolving to the Channel instance
   * @throws Error if the channel ID is not available
   */
  async fetchChannel(): Promise<AnyChannel> {
    if (!this.channelId) {
      throw new Error("Channel ID not available for this interaction");
    }

    if (this.#channel) {
      return this.#channel;
    }

    try {
      const channel = await this.client.rest.channels.fetchChannel(
        this.channelId,
      );
      return channelFactory(this.client, channel);
    } catch (error) {
      throw new Error(`Failed to fetch channel for interaction: ${error}`);
    }
  }

  /**
   * Fetches the Guild instance where this interaction was triggered.
   *
   * This method lazily loads and caches the Guild object.
   *
   * @returns A promise resolving to the Guild instance
   * @throws Error if the interaction is not in a guild
   */
  async fetchGuild(): Promise<Guild> {
    if (!this.isInGuild) {
      throw new Error("Interaction is not in a guild");
    }

    if (this.#guild) {
      return this.#guild;
    }

    try {
      const guild = await this.client.rest.guilds.fetchGuild(
        this.guildId as Snowflake,
      );
      return new Guild(this.client, guild);
    } catch (error) {
      throw new Error(`Failed to fetch guild for interaction: ${error}`);
    }
  }

  /**
   * Fetches the Message instance that this interaction is associated with.
   *
   * This method lazily loads and caches the Message object.
   *
   * @returns A promise resolving to the Message instance
   * @throws Error if the interaction is not associated with a message
   */
  async fetchMessage(): Promise<Message> {
    if (!this.message) {
      throw new Error("This interaction is not associated with a message");
    }

    if (this.#message) {
      return this.#message;
    }

    // If we already have the message data, use it directly
    this.#message = this.message;
    return this.#message;
  }

  /**
   * Responds to the interaction with a message.
   *
   * This method must be called within 3 seconds of receiving the interaction.
   *
   * @param options - Message content to send, or an InteractionResponseEntity for advanced options
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the response fails or the interaction has already been responded to
   */
  async reply(
    options:
      | string
      | InteractionCallbackMessagesEntity
      | InteractionResponseEntity,
  ): Promise<InteractionCallbackResponseEntity> {
    let responsePayload: InteractionResponseEntity;

    if (typeof options === "string") {
      // Convert string to message options
      responsePayload = {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: { content: options },
      };
    } else if ("type" in options) {
      // Already a complete response entity
      responsePayload = options;
    } else {
      // Message options object
      responsePayload = {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: options,
      };
    }

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to reply to interaction: ${error}`);
    }
  }

  /**
   * Defers the interaction response, showing a loading state to the user.
   *
   * This extends the 3-second window for responding to the interaction.
   *
   * @param ephemeral - Whether the response should be ephemeral (only visible to the user)
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the deferral fails
   */
  async deferReply(
    ephemeral = false,
  ): Promise<InteractionCallbackResponseEntity> {
    const responsePayload: InteractionResponseEntity = {
      type: InteractionCallbackType.DeferredChannelMessageWithSource,
      data: ephemeral ? { flags: MessageFlags.Ephemeral } : undefined,
    };

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to defer interaction reply: ${error}`);
    }
  }

  /**
   * Defers updating a message component interaction, without showing a loading state.
   *
   * This should only be used for message component interactions.
   *
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the interaction is not a message component or the deferral fails
   */
  async deferUpdate(): Promise<InteractionCallbackResponseEntity> {
    if (!this.isMessageComponent) {
      throw new Error(
        "deferUpdate can only be used with message component interactions",
      );
    }

    const responsePayload: InteractionResponseEntity = {
      type: InteractionCallbackType.DeferredUpdateMessage,
    };

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to defer interaction update: ${error}`);
    }
  }

  /**
   * Updates the message associated with a component interaction.
   *
   * This should only be used for message component interactions.
   *
   * @param options - New message content or full interaction response
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the interaction is not a message component or the update fails
   */
  async update(
    options:
      | string
      | InteractionCallbackMessagesEntity
      | InteractionResponseEntity,
  ): Promise<InteractionCallbackResponseEntity> {
    if (!this.isMessageComponent) {
      throw new Error(
        "update can only be used with message component interactions",
      );
    }

    let responsePayload: InteractionResponseEntity;

    if (typeof options === "string") {
      // Convert string to message options
      responsePayload = {
        type: InteractionCallbackType.UpdateMessage,
        data: { content: options },
      };
    } else if ("type" in options) {
      // Already a complete response entity
      responsePayload = options;
    } else {
      // Message options object
      responsePayload = {
        type: InteractionCallbackType.UpdateMessage,
        data: options,
      };
    }

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to update message: ${error}`);
    }
  }

  /**
   * Responds to the interaction with a modal popup.
   *
   * This displays a form that the user can fill out and submit.
   *
   * @param options - Modal configuration options or full interaction response
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the modal response fails
   */
  async showModal(
    options: InteractionCallbackModalEntity | InteractionResponseEntity,
  ): Promise<InteractionCallbackResponseEntity> {
    let responsePayload: InteractionResponseEntity;

    if ("type" in options) {
      // Already a complete response entity
      responsePayload = options;
    } else {
      // Modal options object
      responsePayload = {
        type: InteractionCallbackType.Modal,
        data: options,
      };
    }

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to show modal: ${error}`);
    }
  }

  /**
   * Responds to an autocomplete interaction with suggested choices.
   *
   * This should only be used for autocomplete interactions.
   *
   * @param options - Autocomplete suggestions or full interaction response
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the interaction is not an autocomplete or the response fails
   */
  async autocomplete(
    options: InteractionCallbackAutocompleteEntity | InteractionResponseEntity,
  ): Promise<InteractionCallbackResponseEntity> {
    if (!this.isAutocomplete) {
      throw new Error(
        "autocomplete can only be used with autocomplete interactions",
      );
    }

    let responsePayload: InteractionResponseEntity;

    if ("type" in options) {
      // Already a complete response entity
      responsePayload = options;
    } else {
      // Autocomplete options object
      responsePayload = {
        type: InteractionCallbackType.ApplicationCommandAutocompleteResult,
        data: options,
      };
    }

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to send autocomplete response: ${error}`);
    }
  }

  /**
   * Responds to the interaction with a simple acknowledgment.
   *
   * This should only be used for ping interactions during webhook handshakes.
   *
   * @returns A promise resolving to the interaction response entity
   * @throws Error if the interaction is not a ping or the response fails
   */
  async pong(): Promise<InteractionCallbackResponseEntity> {
    if (!this.isPing) {
      throw new Error("pong can only be used with ping interactions");
    }

    const responsePayload: InteractionResponseEntity = {
      type: InteractionCallbackType.Pong,
    };

    try {
      const response = await this.client.rest.interactions.createResponse(
        this.id,
        this.token,
        responsePayload,
        true,
      );

      if (!response) {
        throw new Error("No response received from interaction endpoint");
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to send pong response: ${error}`);
    }
  }

  /**
   * Fetches the original response to this interaction.
   *
   * This retrieves the message that was sent as the initial response.
   *
   * @returns A promise resolving to a Message instance
   * @throws Error if the original response cannot be fetched
   */
  async fetchOriginalResponse(): Promise<Message> {
    try {
      const message = await this.client.rest.interactions.fetchOriginalResponse(
        this.applicationId,
        this.token,
      );

      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to fetch original response: ${error}`);
    }
  }

  /**
   * Edits the original response to this interaction.
   *
   * This modifies the message that was sent as the initial response.
   *
   * @param options - New message content/components/embeds
   * @returns A promise resolving to the updated Message instance
   * @throws Error if the original response cannot be edited
   */
  async editOriginalResponse(
    options: WebhookMessageEditOptions,
  ): Promise<Message> {
    try {
      const message =
        await this.client.rest.interactions.updateOriginalResponse(
          this.applicationId,
          this.token,
          options,
        );

      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to edit original response: ${error}`);
    }
  }

  /**
   * Deletes the original response to this interaction.
   *
   * This removes the message that was sent as the initial response.
   *
   * @returns A promise that resolves when the deletion is complete
   * @throws Error if the original response cannot be deleted
   */
  async deleteOriginalResponse(): Promise<void> {
    try {
      await this.client.rest.interactions.deleteOriginalResponse(
        this.applicationId,
        this.token,
      );
    } catch (error) {
      throw new Error(`Failed to delete original response: ${error}`);
    }
  }

  /**
   * Creates a followup message for this interaction.
   *
   * This sends an additional message after the initial response.
   *
   * @param options - The message content or options
   * @returns A promise resolving to the created Message instance
   * @throws Error if the followup message cannot be created
   */
  async createFollowup(
    options: string | WebhookExecuteOptions,
  ): Promise<Message> {
    let messageOptions: WebhookExecuteOptions;

    if (typeof options === "string") {
      messageOptions = { content: options };
    } else {
      messageOptions = options;
    }

    try {
      const message = await this.client.rest.interactions.createFollowupMessage(
        this.applicationId,
        this.token,
        messageOptions,
      );

      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to create followup message: ${error}`);
    }
  }

  /**
   * Fetches a followup message for this interaction.
   *
   * This retrieves a specific followup message by ID.
   *
   * @param messageId - The ID of the followup message
   * @returns A promise resolving to the Message instance
   * @throws Error if the followup message cannot be fetched
   */
  async fetchFollowup(messageId: Snowflake): Promise<Message> {
    try {
      const message = await this.client.rest.interactions.fetchFollowupMessage(
        this.applicationId,
        this.token,
        messageId,
      );

      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to fetch followup message: ${error}`);
    }
  }

  /**
   * Edits a followup message for this interaction.
   *
   * This modifies a specific followup message by ID.
   *
   * @param messageId - The ID of the followup message
   * @param options - New message content/components/embeds
   * @returns A promise resolving to the updated Message instance
   * @throws Error if the followup message cannot be edited
   */
  async editFollowup(
    messageId: Snowflake,
    options: WebhookMessageEditOptions,
  ): Promise<Message> {
    try {
      const message = await this.client.rest.interactions.updateFollowupMessage(
        this.applicationId,
        this.token,
        messageId,
        options,
      );

      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to edit followup message: ${error}`);
    }
  }

  /**
   * Deletes a followup message for this interaction.
   *
   * This removes a specific followup message by ID.
   *
   * @param messageId - The ID of the followup message
   * @returns A promise that resolves when the deletion is complete
   * @throws Error if the followup message cannot be deleted
   */
  async deleteFollowup(messageId: Snowflake): Promise<void> {
    try {
      await this.client.rest.interactions.deleteFollowupMessage(
        this.applicationId,
        this.token,
        messageId,
      );
    } catch (error) {
      throw new Error(`Failed to delete followup message: ${error}`);
    }
  }

  /**
   * Type guard to check if this is a ping interaction.
   *
   * @returns True if this is a ping interaction, false otherwise
   */
  isPingInteraction(): this is PingInteraction {
    return this.isPing;
  }

  /**
   * Type guard to check if this is an application command interaction.
   *
   * @returns True if this is an application command interaction, false otherwise
   */
  isCommandInteraction(): this is CommandInteraction {
    return this.isCommand;
  }

  /**
   * Type guard to check if this is a message component interaction.
   *
   * @returns True if this is a message component interaction, false otherwise
   */
  isComponentInteraction(): this is ComponentInteraction {
    return this.isMessageComponent;
  }

  /**
   * Type guard to check if this is an autocomplete interaction.
   *
   * @returns True if this is an autocomplete interaction, false otherwise
   */
  isAutocompleteInteraction(): this is AutocompleteInteraction {
    return this.isAutocomplete;
  }

  /**
   * Type guard to check if this is a modal submit interaction.
   *
   * @returns True if this is a modal submit interaction, false otherwise
   */
  isModalSubmitInteraction(): this is ModalSubmitInteraction {
    return this.isModalSubmit;
  }

  /**
   * Type guard to check if this is a guild interaction.
   *
   * @returns True if this is a guild interaction, false otherwise
   */
  isGuildInteraction(): this is GuildInteraction {
    return this.isInGuild;
  }

  /**
   * Type guard to check if this is a DM interaction.
   *
   * @returns True if this is a DM interaction, false otherwise
   */
  isDmInteraction(): this is DmInteraction {
    return this.isInDm;
  }
}

/**
 * Specialized interaction class for PING interactions.
 *
 * Ping interactions are sent during the initial webhook handshake process
 * to verify that the interaction endpoint is available.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#ping}
 */
export class PingInteraction extends Interaction {
  /**
   * Gets the interaction type, which is always Ping (1).
   *
   * @returns The interaction type (Ping)
   */
  override get type(): InteractionType.Ping {
    return InteractionType.Ping;
  }
}

/**
 * Specialized interaction class for APPLICATION_COMMAND interactions.
 *
 * Command interactions are triggered when a user uses a slash command,
 * a user command, or a message command.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands}
 */
export class CommandInteraction extends Interaction {
  /**
   * Gets the interaction type, which is always ApplicationCommand (2).
   *
   * @returns The interaction type (ApplicationCommand)
   */
  override get type(): InteractionType.ApplicationCommand {
    return InteractionType.ApplicationCommand;
  }

  /**
   * Gets the command data, including name, options, and resolved entities.
   *
   * @returns The command data in camelCase format
   */
  get commandData(): ApplicationCommandInteractionDataEntity | undefined {
    return this.rawData.data as ApplicationCommandInteractionDataEntity;
  }

  /**
   * Gets the name of the invoked command.
   *
   * @returns The command name, or undefined if not available
   */
  get commandName(): string | undefined {
    return this.commandData?.name;
  }

  /**
   * Gets the ID of the invoked command.
   *
   * @returns The command ID as a Snowflake string, or undefined if not available
   */
  get commandId(): Snowflake | undefined {
    return this.commandData?.id as Snowflake | undefined;
  }

  /**
   * Gets the type of the invoked command.
   *
   * @returns The command type, or undefined if not available
   */
  get commandType(): ApplicationCommandType | undefined {
    return this.commandData?.type;
  }

  /**
   * Gets the resolved entities from the command.
   *
   * @returns The resolved data in camelCase format, or undefined if not available
   */
  get resolved(): InteractionResolvedDataEntity | undefined {
    return this.commandData?.resolved;
  }

  /**
   * Gets the target ID for user or message commands.
   *
   * @returns The target ID as a Snowflake string, or undefined if not applicable
   */
  get targetId(): Snowflake | undefined {
    return this.commandData?.target_id as Snowflake | undefined;
  }

  /**
   * Type guard to check if this is a slash command interaction.
   *
   * @returns True if this is a slash command interaction, false otherwise
   */
  isSlashCommand(): this is SlashCommandInteraction {
    return this.commandType === ApplicationCommandType.ChatInput;
  }

  /**
   * Type guard to check if this is a user command interaction.
   *
   * @returns True if this is a user command interaction, false otherwise
   */
  isUserCommand(): this is UserCommandInteraction {
    return this.commandType === ApplicationCommandType.User;
  }

  /**
   * Type guard to check if this is a message command interaction.
   *
   * @returns True if this is a message command interaction, false otherwise
   */
  isMessageCommand(): this is MessageCommandInteraction {
    return this.commandType === ApplicationCommandType.Message;
  }
}

/**
 * Specialized interaction class for MESSAGE_COMPONENT interactions.
 *
 * Component interactions are triggered when a user interacts with
 * a button, select menu, or other UI component attached to a message.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components}
 */
export class ComponentInteraction extends Interaction {
  /**
   * Gets the interaction type, which is always MessageComponent (3).
   *
   * @returns The interaction type (MessageComponent)
   */
  override get type(): InteractionType.MessageComponent {
    return InteractionType.MessageComponent;
  }

  /**
   * Gets the component data, including custom ID and values.
   *
   * @returns The component data in camelCase format
   */
  get componentData(): MessageComponentInteractionDataEntity | undefined {
    return this.data as MessageComponentInteractionDataEntity | undefined;
  }

  /**
   * Gets the custom ID of the component.
   *
   * This is the developer-defined identifier specified when creating the component.
   *
   * @returns The custom ID string, or undefined if not available
   */
  get customId(): string | undefined {
    return this.componentData?.custom_id;
  }

  /**
   * Gets the type of the component.
   *
   * @returns The component type, or undefined if not available
   */
  get componentType(): ComponentType | undefined {
    return this.componentData?.component_type;
  }

  /**
   * Type guard to check if this is a button interaction.
   *
   * @returns True if this is a button interaction, false otherwise
   */
  isButtonInteraction(): this is ButtonInteraction {
    return this.componentType === ComponentType.Button;
  }

  /**
   * Type guard to check if this is a select menu interaction.
   *
   * @returns True if this is a select menu interaction, false otherwise
   */
  isSelectMenuInteraction(): this is SelectMenuInteraction {
    return (
      this.componentType !== undefined &&
      this.componentType >= ComponentType.StringSelect &&
      this.componentType <= ComponentType.ChannelSelect
    );
  }
}

/**
 * Specialized interaction class for APPLICATION_COMMAND_AUTOCOMPLETE interactions.
 *
 * Autocomplete interactions are triggered when a user is typing in a command
 * option that has autocomplete enabled.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#autocomplete}
 */
export class AutocompleteInteraction extends Interaction {
  /**
   * Gets the interaction type, which is always ApplicationCommandAutocomplete (4).
   *
   * @returns The interaction type (ApplicationCommandAutocomplete)
   */
  override get type(): InteractionType.ApplicationCommandAutocomplete {
    return InteractionType.ApplicationCommandAutocomplete;
  }

  /**
   * Gets the command data, including name, options, and focused field.
   *
   * @returns The command data in camelCase format
   */
  get commandData(): ApplicationCommandInteractionDataEntity | undefined {
    return this.data as ApplicationCommandInteractionDataEntity | undefined;
  }

  /**
   * Gets the name of the command being autocompleted.
   *
   * @returns The command name, or undefined if not available
   */
  get commandName(): string | undefined {
    return this.commandData?.name;
  }

  /**
   * Gets the ID of the command being autocompleted.
   *
   * @returns The command ID as a Snowflake string, or undefined if not available
   */
  get commandId(): Snowflake | undefined {
    return this.commandData?.id as Snowflake | undefined;
  }

  /**
   * Gets the options provided with the command.
   *
   * @returns An array of command options in camelCase format, or undefined if none
   */
  get options(): AnyInteractionCommandOptionEntity[] | undefined {
    return this.commandData?.options;
  }

  /**
   * Gets the option that is currently being autocompleted.
   *
   * This is the option where the user is currently typing.
   *
   * @returns The focused option in camelCase format, or undefined if none
   */
  get focusedOption(): AnyInteractionCommandOptionEntity | undefined {
    if (!this.options) {
      return undefined;
    }

    // Find the option with focused=true
    return this.options.find(
      (option) =>
        (option as AnySimpleInteractionCommandOptionEntity).focused === true,
    );
  }

  /**
   * Gets the name of the option that is currently being autocompleted.
   *
   * @returns The focused option name, or undefined if none
   */
  get focusedName(): string | undefined {
    return this.focusedOption?.name;
  }

  /**
   * Gets the value that the user has typed so far.
   *
   * @returns The focused option value, or undefined if none
   */
  get focusedValue(): string | number | boolean | undefined {
    return (this.focusedOption as AnySimpleInteractionCommandOptionEntity)
      ?.value;
  }
}

/**
 * Specialized interaction class for MODAL_SUBMIT interactions.
 *
 * Modal submit interactions are triggered when a user submits a modal form
 * that was presented to them.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal-submit}
 */
export class ModalSubmitInteraction extends Interaction {
  /**
   * Gets the interaction type, which is always ModalSubmit (5).
   *
   * @returns The interaction type (ModalSubmit)
   */
  override get type(): InteractionType.ModalSubmit {
    return InteractionType.ModalSubmit;
  }

  /**
   * Gets the modal data, including custom ID and components.
   *
   * @returns The modal data in camelCase format
   */
  get modalData(): ModalSubmitInteractionDataEntity | undefined {
    return this.data as ModalSubmitInteractionDataEntity | undefined;
  }

  /**
   * Gets the custom ID of the modal.
   *
   * This is the developer-defined identifier specified when creating the modal.
   *
   * @returns The custom ID string, or undefined if not available
   */
  get customId(): string | undefined {
    return this.modalData?.custom_id;
  }

  /**
   * Gets the components submitted with the modal.
   *
   * @returns An array of action row components in camelCase format, or undefined if not available
   */
  get components(): ActionRowEntity[] | undefined {
    return this.modalData?.components;
  }

  /**
   * Gets the fields submitted in the modal.
   *
   * @returns A map of field custom IDs to their values
   */
  get fields(): Map<string, string> {
    const fields = new Map<string, string>();

    if (!this.components) {
      return fields;
    }

    // Traverse the component structure to find text inputs
    for (const actionRow of this.components) {
      if (!actionRow.components) {
        continue;
      }

      for (const component of actionRow.components) {
        if (
          !("custom_id" in component) ||
          component.type !== ComponentType.TextInput
        ) {
          continue;
        }

        fields.set(component.custom_id, component.value || "");
      }
    }

    return fields;
  }

  /**
   * Gets a specific field value by custom ID.
   *
   * @param customId - The custom ID of the field to retrieve
   * @returns The field value, or undefined if not found
   */
  getField(customId: string): string | undefined {
    return this.fields.get(customId);
  }
}

/**
 * Specialized class for guild-specific interactions.
 *
 * Guild interactions have additional properties and methods
 * related to guild contexts.
 *
 * This class acts as a mixin that can be applied to any interaction type.
 */
export interface GuildInteraction extends Interaction {
  /**
   * Gets the ID of the guild where this interaction was triggered.
   *
   * This is guaranteed to be present for guild interactions.
   */
  readonly guildId: Snowflake;

  /**
   * Gets the guild member object for the user who triggered this interaction.
   *
   * This is guaranteed to be present for guild interactions.
   */
  readonly member: GuildMember;
}

/**
 * Specialized class for DM-specific interactions.
 *
 * DM interactions have different properties and methods
 * compared to guild interactions.
 *
 * This class acts as a mixin that can be applied to any interaction type.
 */
export interface DmInteraction extends Interaction {
  /**
   * Gets the user who triggered this interaction.
   *
   * This is guaranteed to be present for DM interactions.
   */
  readonly user: User;

  /**
   * Gets the ID of the channel where this interaction was triggered.
   *
   * This is guaranteed to be present for DM interactions.
   */
  readonly channelId: Snowflake;
}

/**
 * Specialized CommandInteraction class for Slash Commands.
 *
 * Slash Commands are text-based commands that appear when a user types '/'.
 * They provide a tree-like command structure with options and subcommands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#slash-commands}
 */
export class SlashCommandInteraction extends CommandInteraction {
  /**
   * Gets the application command type, which is always ChatInput (1).
   *
   * @returns The application command type (ChatInput)
   */
  override get commandType(): ApplicationCommandType.ChatInput {
    return ApplicationCommandType.ChatInput;
  }

  /**
   * Gets the options provided with the command.
   *
   * @returns An array of command options in camelCase format, or undefined if none
   */
  get options(): AnyInteractionCommandOptionEntity[] | undefined {
    return this.commandData?.options;
  }

  /**
   * Checks if this is a subcommand.
   *
   * @returns True if the command contains a subcommand, false otherwise
   */
  get isSubcommand(): boolean {
    if (!this.options || this.options.length === 0) {
      return false;
    }
    return this.options[0]?.type === ApplicationCommandOptionType.SubCommand;
  }

  /**
   * Checks if this is a subcommand group.
   *
   * @returns True if the command contains a subcommand group, false otherwise
   */
  get isSubcommandGroup(): boolean {
    if (!this.options || this.options.length === 0) {
      return false;
    }
    return (
      this.options[0]?.type === ApplicationCommandOptionType.SubCommandGroup
    );
  }

  /**
   * Gets the subcommand name, if this is a subcommand.
   *
   * @returns The subcommand name, or undefined if not a subcommand
   */
  get subcommandName(): string | undefined {
    if (!this.isSubcommand) {
      return undefined;
    }
    return this.options?.[0]?.name;
  }

  /**
   * Gets the subcommand group name, if this is a subcommand group.
   *
   * @returns The subcommand group name, or undefined if not a subcommand group
   */
  get subcommandGroupName(): string | undefined {
    if (!this.isSubcommandGroup) {
      return undefined;
    }
    return this.options?.[0]?.name;
  }

  /**
   * Gets the full command name, including subcommands and groups.
   *
   * @returns The full command name with subcommands, e.g. "command subcommandGroup subcommand"
   */
  get fullCommandName(): string {
    let name = this.commandName || "";

    if (this.isSubcommandGroup) {
      name += ` ${this.subcommandGroupName}`;
      const subcommand = (
        this.options?.[0] as SubCommandGroupInteractionOptionEntity
      )?.options?.[0];
      if (subcommand) {
        name += ` ${subcommand.name}`;
      }
    } else if (this.isSubcommand) {
      name += ` ${this.subcommandName}`;
    }

    return name;
  }

  /**
   * Gets the options for a subcommand.
   *
   * @returns An array of subcommand options in camelCase format, or undefined if not a subcommand
   */
  get subcommandOptions(): AnyInteractionCommandOptionEntity[] | undefined {
    if (!this.isSubcommand) {
      return undefined;
    }

    const subcommand = this.options?.[0] as SubCommandInteractionOptionEntity;
    if (!subcommand?.options) {
      return [];
    }

    return subcommand.options;
  }

  /**
   * Gets the options for a subcommand in a subcommand group.
   *
   * @returns An array of subcommand options in camelCase format, or undefined if not in a subcommand group
   */
  get subcommandGroupOptions():
    | AnySimpleInteractionCommandOptionEntity[]
    | undefined {
    if (!this.isSubcommandGroup) {
      return undefined;
    }

    const subcommandGroup = this
      .options?.[0] as SubCommandGroupInteractionOptionEntity;
    if (!subcommandGroup?.options || subcommandGroup.options.length === 0) {
      return [];
    }

    const subcommand = subcommandGroup.options[0];
    if (!subcommand?.options) {
      return [];
    }

    return subcommand.options;
  }

  /**
   * Gets a specific option by name.
   *
   * @param name - The name of the option to retrieve
   * @returns The option in camelCase format, or undefined if not found
   */
  getOption(name: string): AnyInteractionCommandOptionEntity | undefined {
    if (!this.options) {
      return undefined;
    }
    return this.options.find((option) => option.name === name);
  }

  /**
   * Gets a string option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The string value, or undefined if not found or wrong type
   */
  getString(name: string): string | undefined {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.String) {
      return undefined;
    }
    return option.value as string;
  }

  /**
   * Gets an integer option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The integer value, or undefined if not found or wrong type
   */
  getInteger(name: string): number | undefined {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Integer) {
      return undefined;
    }
    return option.value as number;
  }

  /**
   * Gets a number option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The number value, or undefined if not found or wrong type
   */
  getNumber(name: string): number | undefined {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Number) {
      return undefined;
    }
    return option.value as number;
  }

  /**
   * Gets a boolean option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The boolean value, or undefined if not found or wrong type
   */
  getBoolean(name: string): boolean | undefined {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Boolean) {
      return undefined;
    }
    return option.value as boolean;
  }

  /**
   * Gets a user option value.
   *
   * @param name - The name of the option to retrieve
   * @returns A promise resolving to the User instance, or undefined if not found or wrong type
   */
  async getUser(name: string): Promise<User | undefined> {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.User) {
      return undefined;
    }

    const userId = option.value as string;
    if (!this.resolved?.users?.[userId]) {
      return undefined;
    }

    try {
      const user = await this.client.rest.users.fetchUser(userId as Snowflake);
      return new User(this.client, user);
    } catch {
      return undefined;
    }
  }

  /**
   * Gets a member option value, combining user and member data.
   *
   * @param name - The name of the option to retrieve
   * @returns A promise resolving to the GuildMember instance, or undefined if not found, wrong type, or not in a guild
   */
  async getMember(name: string): Promise<GuildMember | undefined> {
    if (!this.isGuildInteraction()) {
      return undefined;
    }

    const user = await this.getUser(name);
    if (!user) {
      return undefined;
    }

    const userId = user.id;
    if (!this.resolved?.members?.[userId]) {
      return undefined;
    }

    try {
      return await user.fetchGuildMember(this.guildId);
    } catch {
      return undefined;
    }
  }

  /**
   * Gets a channel option value.
   *
   * @param name - The name of the option to retrieve
   * @returns A promise resolving to the Channel instance, or undefined if not found or wrong type
   */
  async getChannel(name: string): Promise<AnyChannel | undefined> {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Channel) {
      return undefined;
    }

    const channelId = option.value as string;
    if (!this.resolved?.channels?.[channelId]) {
      return undefined;
    }

    try {
      const channel = await this.client.rest.channels.fetchChannel(
        channelId as Snowflake,
      );
      return channelFactory(this.client, channel);
    } catch {
      return undefined;
    }
  }

  /**
   * Gets a role option value.
   *
   * @param name - The name of the option to retrieve
   * @returns A promise resolving to the Role instance, or undefined if not found or wrong type
   */
  async getRole(name: string): Promise<Role | undefined> {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Role) {
      return undefined;
    }

    const roleId = option.value as string;
    if (!this.resolved?.roles?.[roleId]) {
      return undefined;
    }

    try {
      if (!this.isGuildInteraction()) {
        return undefined;
      }
      const role = await this.client.rest.guilds.fetchGuildRole(
        this.guildId,
        roleId as Snowflake,
      );
      return new Role(this.client, {
        ...role,
        guild_id: this.guildId,
      });
    } catch {
      return undefined;
    }
  }

  /**
   * Gets a mentionable option value, which could be a user, member, or role.
   *
   * @param name - The name of the option to retrieve
   * @returns A promise resolving to the User, GuildMember, or Role instance, or undefined if not found or wrong type
   */
  async getMentionable(
    name: string,
  ): Promise<User | GuildMember | Role | undefined> {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Mentionable) {
      return undefined;
    }

    const id = option.value as string;

    // Check if it's a user/member first
    if (this.resolved?.users?.[id]) {
      const user = await this.getUser(name);
      if (user) {
        // If we're in a guild and have member data, return a GuildMember
        if (this.isGuildInteraction() && this.resolved?.members?.[id]) {
          const member = await this.getMember(name);
          if (member) {
            return member;
          }
        }
        return user;
      }
    }

    // Check if it's a role
    if (this.resolved?.roles?.[id]) {
      const role = await this.getRole(name);
      if (role) {
        return role;
      }
    }

    return undefined;
  }

  /**
   * Gets an attachment option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The Attachment instance, or undefined if not found or wrong type
   */
  getAttachment(name: string): AttachmentEntity | undefined {
    const option = this.getOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Attachment) {
      return undefined;
    }

    const attachmentId = option.value as string;
    if (!this.resolved?.attachments?.[attachmentId]) {
      return undefined;
    }

    return this.resolved.attachments[attachmentId];
  }

  /**
   * Gets a specific subcommand option by name.
   *
   * @param name - The name of the subcommand option to retrieve
   * @returns The option in camelCase format, or undefined if not found
   */
  getSubcommandOption(
    name: string,
  ): AnyInteractionCommandOptionEntity | undefined {
    const options = this.isSubcommandGroup
      ? this.subcommandGroupOptions
      : this.subcommandOptions;
    if (!options) {
      return undefined;
    }

    return options.find((option) => option.name === name);
  }

  /**
   * Gets a string subcommand option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The string value, or undefined if not found or wrong type
   */
  getSubcommandString(name: string): string | undefined {
    const option = this.getSubcommandOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.String) {
      return undefined;
    }
    return option.value as string;
  }

  /**
   * Gets an integer subcommand option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The integer value, or undefined if not found or wrong type
   */
  getSubcommandInteger(name: string): number | undefined {
    const option = this.getSubcommandOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Integer) {
      return undefined;
    }
    return option.value as number;
  }

  /**
   * Gets a number subcommand option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The number value, or undefined if not found or wrong type
   */
  getSubcommandNumber(name: string): number | undefined {
    const option = this.getSubcommandOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Number) {
      return undefined;
    }
    return option.value as number;
  }

  /**
   * Gets a boolean subcommand option value.
   *
   * @param name - The name of the option to retrieve
   * @returns The boolean value, or undefined if not found or wrong type
   */
  getSubcommandBoolean(name: string): boolean | undefined {
    const option = this.getSubcommandOption(name);
    if (!option || option.type !== ApplicationCommandOptionType.Boolean) {
      return undefined;
    }
    return option.value as boolean;
  }

  /**
   * Type guard to check if this is a guild slash command interaction.
   *
   * @returns True if this is a guild slash command interaction, false otherwise
   */
  isGuildSlashCommand(): this is SlashCommandInteraction & GuildInteraction {
    return this.isGuildInteraction();
  }

  /**
   * Type guard to check if this is a DM slash command interaction.
   *
   * @returns True if this is a DM slash command interaction, false otherwise
   */
  isDmSlashCommand(): this is SlashCommandInteraction & DmInteraction {
    return this.isDmInteraction();
  }
}

/**
 * Specialized CommandInteraction class for User Context Menu Commands.
 *
 * User Commands appear in the context menu when right-clicking a user,
 * and provide a direct way to perform actions on a specific user.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#user-commands}
 */
export class UserCommandInteraction extends CommandInteraction {
  /**
   * Gets the application command type, which is always User (2).
   *
   * @returns The application command type (User)
   */
  override get commandType(): ApplicationCommandType.User {
    return ApplicationCommandType.User;
  }

  /**
   * Gets the ID of the targeted user.
   *
   * @returns The target user ID as a Snowflake string, or undefined if not available
   */
  override get targetId(): Snowflake | undefined {
    return super.targetId;
  }

  /**
   * Gets the targeted user as a User instance.
   *
   * @returns A promise resolving to the User instance
   * @throws Error if the target user is not found
   */
  async getTargetUser(): Promise<User> {
    if (!(this.resolved?.users && this.targetId)) {
      throw new Error("Target user not found in resolved data");
    }

    try {
      const user = await this.client.rest.users.fetchUser(this.targetId);
      return new User(this.client, user);
    } catch (error) {
      throw new Error(`Failed to fetch target user: ${error}`);
    }
  }

  /**
   * Gets the targeted user as a GuildMember instance, if in a guild.
   *
   * @returns A promise resolving to the GuildMember instance, or undefined if not in a guild
   */
  async getTargetMember(): Promise<GuildMember | undefined> {
    if (!this.isGuildInteraction()) {
      return undefined;
    }

    const user = await this.getTargetUser();

    try {
      return await user.fetchGuildMember(this.guildId);
    } catch {
      return undefined;
    }
  }

  /**
   * Type guard to check if this is a guild user command interaction.
   *
   * @returns True if this is a guild user command interaction, false otherwise
   */
  isGuildUserCommand(): this is UserCommandInteraction & GuildInteraction {
    return this.isGuildInteraction();
  }

  /**
   * Type guard to check if this is a DM user command interaction.
   *
   * @returns True if this is a DM user command interaction, false otherwise
   */
  isDmUserCommand(): this is UserCommandInteraction & DmInteraction {
    return this.isDmInteraction();
  }
}

/**
 * Specialized CommandInteraction class for Message Context Menu Commands.
 *
 * Message Commands appear in the context menu when right-clicking a message,
 * and provide a direct way to perform actions on a specific message.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#message-commands}
 */
export class MessageCommandInteraction extends CommandInteraction {
  /**
   * Gets the application command type, which is always Message (3).
   *
   * @returns The application command type (Message)
   */
  override get commandType(): ApplicationCommandType.Message {
    return ApplicationCommandType.Message;
  }

  /**
   * Gets the ID of the targeted message.
   *
   * @returns The target message ID as a Snowflake string, or undefined if not available
   */
  override get targetId(): Snowflake | undefined {
    return super.targetId;
  }

  /**
   * Gets the targeted message as a Message instance.
   *
   * @returns A promise resolving to the Message instance
   * @throws Error if the target message is not found
   */
  async getTargetMessage(): Promise<Message> {
    if (!(this.resolved?.messages && this.targetId)) {
      throw new Error("Target message not found in resolved data");
    }

    // Use the resolved message data directly if available
    const resolvedMessage = this.resolved.messages[this.targetId];
    if (resolvedMessage) {
      return new Message(this.client, resolvedMessage as MessageEntity);
    }

    // Fallback to fetching from channel if not in resolved data
    try {
      const channel = await this.fetchChannel();

      // Check if channel has fetchMessage method (most channel types do)
      if (
        "fetchMessage" in channel &&
        typeof channel.fetchMessage === "function"
      ) {
        return await channel.fetchMessage(this.targetId);
      }

      throw new Error("Channel does not support message fetching");
    } catch (error) {
      throw new Error(`Failed to fetch target message: ${error}`);
    }
  }

  /**
   * Type guard to check if this is a guild message command interaction.
   *
   * @returns True if this is a guild message command interaction, false otherwise
   */
  isGuildMessageCommand(): this is MessageCommandInteraction &
    GuildInteraction {
    return this.isGuildInteraction();
  }

  /**
   * Type guard to check if this is a DM message command interaction.
   *
   * @returns True if this is a DM message command interaction, false otherwise
   */
  isDmMessageCommand(): this is MessageCommandInteraction & DmInteraction {
    return this.isDmInteraction();
  }
}

/**
 * Specialized ComponentInteraction class for Button interactions.
 *
 * Button interactions are triggered when a user clicks a button
 * attached to a message.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#buttons}
 */
export class ButtonInteraction extends ComponentInteraction {
  /**
   * Gets the component type, which is always Button (2).
   *
   * @returns The component type (Button)
   */
  override get componentType(): ComponentType.Button {
    return ComponentType.Button;
  }

  /**
   * Type guard to check if this is a guild button interaction.
   *
   * @returns True if this is a guild button interaction, false otherwise
   */
  isGuildButton(): this is ButtonInteraction & GuildInteraction {
    return this.isGuildInteraction();
  }

  /**
   * Type guard to check if this is a DM button interaction.
   *
   * @returns True if this is a DM button interaction, false otherwise
   */
  isDmButton(): this is ButtonInteraction & DmInteraction {
    return this.isDmInteraction();
  }
}

/**
 * Specialized ComponentInteraction class for Select Menu interactions.
 *
 * Select Menu interactions are triggered when a user makes a selection
 * from a dropdown menu attached to a message.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menus}
 */
export class SelectMenuInteraction extends ComponentInteraction {
  /**
   * Gets the values selected by the user.
   *
   * For string selects, these are the values of the selected options.
   * For entity selects, these are the IDs of the selected entities.
   *
   * @returns An array of selected values as strings, or undefined if none
   */
  get values(): string[] | undefined {
    return this.componentData?.values as string[] | undefined;
  }

  /**
   * Gets the selected options for string select menus.
   *
   * @returns An array of selected options in camelCase format, or undefined if not applicable
   */
  get options(): SelectMenuOptionEntity[] | undefined {
    if (this.componentType !== ComponentType.StringSelect) {
      return undefined;
    }
    return this.componentData?.values;
  }

  /**
   * Gets the resolved entities from the select menu.
   *
   * @returns The resolved data in camelCase format, or undefined if not applicable
   */
  get resolvedEntities(): InteractionResolvedDataEntity | undefined {
    if (this.componentType === ComponentType.StringSelect) {
      return undefined;
    }
    return this.componentData?.resolved;
  }

  /**
   * Gets the selected users from a user select menu.
   *
   * @returns An array of User instances
   */
  getSelectedUsers(): User[] {
    if (
      this.componentType !== ComponentType.UserSelect &&
      this.componentType !== ComponentType.MentionableSelect
    ) {
      return [];
    }

    if (!(this.resolvedEntities?.users && this.values)) {
      return [];
    }

    const users: User[] = [];
    for (const id of this.values) {
      const userData = this.resolvedEntities.users[id];
      if (userData) {
        users.push(new User(this.client, userData));
      }
    }

    return users;
  }

  /**
   * Gets the selected members from a user select menu in a guild.
   *
   * @returns An array of GuildMember instances
   */
  getSelectedMembers(): GuildMember[] {
    if (!this.isGuildInteraction()) {
      return [];
    }
    if (
      this.componentType !== ComponentType.UserSelect &&
      this.componentType !== ComponentType.MentionableSelect
    ) {
      return [];
    }

    if (
      !(
        this.resolvedEntities?.members &&
        this.resolvedEntities?.users &&
        this.values
      )
    ) {
      return [];
    }

    const members: GuildMember[] = [];
    for (const id of this.values) {
      const memberData = this.resolvedEntities.members[id];
      const userData = this.resolvedEntities.users[id];

      if (memberData && userData) {
        members.push(
          new GuildMember(this.client, {
            ...(memberData as GuildMemberEntity),
            user: userData,
            guild_id: this.guildId,
          }),
        );
      }
    }

    return members;
  }

  /**
   * Gets the selected roles from a role select menu.
   *
   * @returns A promise resolving to an array of Role instances
   */
  async getSelectedRoles(): Promise<Role[]> {
    if (!this.isGuildInteraction()) {
      return [];
    }
    if (
      this.componentType !== ComponentType.RoleSelect &&
      this.componentType !== ComponentType.MentionableSelect
    ) {
      return [];
    }

    if (!(this.resolvedEntities?.roles && this.values)) {
      return [];
    }

    const roles: Role[] = [];
    for (const id of this.values) {
      try {
        const role = await this.client.rest.guilds.fetchGuildRole(
          this.guildId,
          id as Snowflake,
        );
        roles.push(new Role(this.client, { ...role, guild_id: this.guildId }));
      } catch {}
    }

    return roles;
  }

  /**
   * Gets the selected channels from a channel select menu.
   *
   * @returns A promise resolving to an array of Channel instances
   */
  async getSelectedChannels(): Promise<AnyChannel[]> {
    if (this.componentType !== ComponentType.ChannelSelect) {
      return [];
    }
    if (!(this.resolvedEntities?.channels && this.values)) {
      return [];
    }

    const channels: AnyChannel[] = [];
    for (const id of this.values) {
      try {
        const channel = await this.client.rest.channels.fetchChannel(
          id as Snowflake,
        );
        channels.push(channelFactory(this.client, channel));
      } catch {}
    }

    return channels;
  }

  /**
   * Type guard to check if this is a string select menu.
   *
   * @returns True if this is a string select menu, false otherwise
   */
  isStringSelect(): boolean {
    return this.componentType === ComponentType.StringSelect;
  }

  /**
   * Type guard to check if this is a user select menu.
   *
   * @returns True if this is a user select menu, false otherwise
   */
  isUserSelect(): boolean {
    return this.componentType === ComponentType.UserSelect;
  }

  /**
   * Type guard to check if this is a role select menu.
   *
   * @returns True if this is a role select menu, false otherwise
   */
  isRoleSelect(): boolean {
    return this.componentType === ComponentType.RoleSelect;
  }

  /**
   * Type guard to check if this is a mentionable select menu.
   *
   * @returns True if this is a mentionable select menu, false otherwise
   */
  isMentionableSelect(): boolean {
    return this.componentType === ComponentType.MentionableSelect;
  }

  /**
   * Type guard to check if this is a channel select menu.
   *
   * @returns True if this is a channel select menu, false otherwise
   */
  isChannelSelect(): boolean {
    return this.componentType === ComponentType.ChannelSelect;
  }

  /**
   * Type guard to check if this is a guild select menu interaction.
   *
   * @returns True if this is a guild select menu interaction, false otherwise
   */
  isGuildSelect(): this is SelectMenuInteraction & GuildInteraction {
    return this.isGuildInteraction();
  }

  /**
   * Type guard to check if this is a DM select menu interaction.
   *
   * @returns True if this is a DM select menu interaction, false otherwise
   */
  isDmSelect(): this is SelectMenuInteraction & DmInteraction {
    return this.isDmInteraction();
  }
}

/**
 * Union type representing any possible interaction type.
 * This type can be used when you need to handle any kind of interaction.
 */
export type AnyInteraction =
  | Interaction
  | PingInteraction
  | CommandInteraction
  | SlashCommandInteraction
  | UserCommandInteraction
  | MessageCommandInteraction
  | ComponentInteraction
  | ButtonInteraction
  | SelectMenuInteraction
  | AutocompleteInteraction
  | ModalSubmitInteraction;

/**
 * Union type representing any guild-specific interaction.
 * These interactions have guild context and member data.
 */
export type AnyGuildInteraction =
  | (Interaction & GuildInteraction)
  | (PingInteraction & GuildInteraction)
  | (CommandInteraction & GuildInteraction)
  | (SlashCommandInteraction & GuildInteraction)
  | (UserCommandInteraction & GuildInteraction)
  | (MessageCommandInteraction & GuildInteraction)
  | (ComponentInteraction & GuildInteraction)
  | (ButtonInteraction & GuildInteraction)
  | (SelectMenuInteraction & GuildInteraction)
  | (AutocompleteInteraction & GuildInteraction)
  | (ModalSubmitInteraction & GuildInteraction);

/**
 * Union type representing any DM-specific interaction.
 * These interactions have user data but no guild context.
 */
export type AnyDmInteraction =
  | (Interaction & DmInteraction)
  | (PingInteraction & DmInteraction)
  | (CommandInteraction & DmInteraction)
  | (SlashCommandInteraction & DmInteraction)
  | (UserCommandInteraction & DmInteraction)
  | (MessageCommandInteraction & DmInteraction)
  | (ComponentInteraction & DmInteraction)
  | (ButtonInteraction & DmInteraction)
  | (SelectMenuInteraction & DmInteraction)
  | (AutocompleteInteraction & DmInteraction)
  | (ModalSubmitInteraction & DmInteraction);
