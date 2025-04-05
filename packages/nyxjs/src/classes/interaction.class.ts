import {
  type ActionRowEntity,
  type AnyCommandOptionEntity,
  type AnyInteractionEntity,
  type AnySimpleCommandOptionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type BotDmInteractionEntity,
  ComponentType,
  type GuildInteractionEntity,
  type GuildMemberEntity,
  type InteractionCallbackAutocompleteEntity,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  type InteractionCallbackResponseEntity,
  InteractionCallbackType,
  InteractionContextType,
  type InteractionResponseEntity,
  InteractionType,
  type Locale,
  type MessageComponentInteractionDataEntity,
  type MessageEntity,
  MessageFlags,
  type ModalSubmitInteractionDataEntity,
  type PrivateChannelInteractionEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type SubCommandGroupOptionEntity,
  type SubCommandOptionEntity,
  type UserEntity,
} from "@nyxjs/core";
import type {
  EditWebhookMessageSchema,
  ExecuteWebhookSchema,
} from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import type { AnyChannel } from "./channel.class.js";
import { User } from "./user.class.js";

/**
 * Base class for Discord interactions.
 *
 * Provides common properties and methods shared across all interaction types.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding}
 */
export abstract class Interaction<
  T extends AnyInteractionEntity = AnyInteractionEntity,
> extends BaseClass<T> {
  /**
   * The unique ID of this interaction
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The ID of the application this interaction is for
   */
  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  /**
   * The type of interaction
   */
  get type(): InteractionType {
    return this.data.type;
  }

  /**
   * The interaction data payload
   * Contains different information depending on the interaction type
   */
  get interactionData(): T["data"] {
    return this.data.data;
  }

  /**
   * The context where the interaction was triggered from
   */
  get context(): InteractionContextType {
    return this.data.context ?? InteractionContextType.Guild;
  }

  /**
   * The continuation token for responding to the interaction
   */
  get token(): string {
    return this.data.token;
  }

  /**
   * The channel ID that the interaction was sent from, if available
   */
  get channelId(): Snowflake | undefined {
    return this.data.channel_id;
  }

  /**
   * The channel that the interaction was sent from, if available
   */
  get channel(): AnyChannel | undefined {
    if (!this.channelId) {
      return undefined;
    }

    return this.client.channels.get(this.channelId) as AnyChannel;
  }

  /**
   * The bitwise set of permissions the app has in the source location of the interaction
   */
  get appPermissions(): string {
    return this.data.app_permissions;
  }

  /**
   * The locale of the invoking user
   */
  get locale(): string | undefined {
    return this.data.locale;
  }

  /**
   * The guild ID where this interaction was triggered, if in a guild
   */
  get guildId(): Snowflake | undefined {
    if (this.isGuildInteraction()) {
      return this.data.guild_id;
    }
    return undefined;
  }

  /**
   * The user who triggered this interaction
   */
  get user(): User {
    if (this.isGuildInteraction()) {
      return new User(this.client, this.data.member.user);
    }
    return new User(this.client, this.data.user as UserEntity);
  }

  /**
   * The member who triggered this interaction, if in a guild
   */
  get member(): GuildMemberEntity | undefined {
    if (this.isGuildInteraction()) {
      return this.data.member;
    }

    return undefined;
  }

  /**
   * Checks if this interaction was triggered in a guild
   */
  isGuildInteraction(): this is GuildInteraction {
    return this.context === InteractionContextType.Guild;
  }

  /**
   * Checks if this interaction was triggered in a DM with the bot
   */
  isBotDmInteraction(): this is BotDmInteraction {
    return this.context === InteractionContextType.BotDm;
  }

  /**
   * Checks if this interaction was triggered in a private channel
   */
  isPrivateChannelInteraction(): this is PrivateChannelInteraction {
    return this.context === InteractionContextType.PrivateChannel;
  }

  isPing(interaction: Interaction): interaction is PingInteraction {
    return interaction.type === InteractionType.Ping;
  }

  /**
   * Type guard for checking if an interaction is an application command
   */
  isApplicationCommand(): this is ApplicationCommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }

  /**
   * Type guard for checking if an interaction is a slash command
   */
  isSlashCommand(): this is SlashCommandInteraction {
    return (
      this.type === InteractionType.ApplicationCommand &&
      (this.interactionData as ApplicationCommandInteractionDataEntity).type ===
        ApplicationCommandType.ChatInput
    );
  }

  /**
   * Type guard for checking if an interaction is a user command
   */
  isUserCommand(): this is UserCommandInteraction {
    return (
      this.type === InteractionType.ApplicationCommand &&
      (this.interactionData as ApplicationCommandInteractionDataEntity).type ===
        ApplicationCommandType.User
    );
  }

  /**
   * Type guard for checking if an interaction is a message command
   */
  isMessageCommand(): this is MessageCommandInteraction {
    return (
      this.type === InteractionType.ApplicationCommand &&
      (this.interactionData as ApplicationCommandInteractionDataEntity).type ===
        ApplicationCommandType.Message
    );
  }

  /**
   * Type guard for checking if an interaction is a message component
   */
  isMessageComponent(): this is MessageComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }

  /**
   * Type guard for checking if an interaction is a button
   */
  isButton(): this is ButtonInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this.interactionData as MessageComponentInteractionDataEntity)
        .component_type === ComponentType.Button
    );
  }

  /**
   * Type guard for checking if an interaction is a select menu
   */
  isSelectMenu(): this is SelectMenuInteraction {
    if (this.type !== InteractionType.MessageComponent) {
      return false;
    }

    const componentType = (
      this.interactionData as MessageComponentInteractionDataEntity
    ).component_type;

    return (
      componentType === ComponentType.StringSelect ||
      componentType === ComponentType.UserSelect ||
      componentType === ComponentType.RoleSelect ||
      componentType === ComponentType.MentionableSelect ||
      componentType === ComponentType.ChannelSelect
    );
  }

  /**
   * Type guard for checking if an interaction is an autocomplete interaction
   */
  isAutocomplete(): this is AutocompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  /**
   * Type guard for checking if an interaction is a modal submission
   */
  isModalSubmit(): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }

  /**
   * Creates a response to this interaction
   * @param options - The response to send
   * @param withResponse - Whether to return the interaction callback response
   * @returns The interaction callback response if withResponse is true
   * @throws Error if the interaction token is invalid
   * @remarks
   * - You must respond to an interaction within 3 seconds or the token will be invalidated
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createResponse(
    options: InteractionResponseEntity,
    withResponse = false,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.client.rest.interactions.createInteractionResponse(
      this.id,
      this.token,
      options,
      withResponse,
    );
  }

  /**
   * Gets the original response to this interaction
   * @returns Promise resolving to the original message response
   * @remarks
   * - Works after responding to an interaction with reply(), deferReply(), etc.
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
   */
  fetchReply(): Promise<MessageEntity> {
    return this.client.rest.interactions.getOriginalInteractionResponse(
      this.client.user.id,
      this.token,
    );
  }

  /**
   * Edits the original response to this interaction
   * @param options - The new message content or options
   * @returns Promise resolving to the updated message
   * @remarks
   * - Use after deferReply() to send your actual response
   * - You can also use this to edit a response that's already been sent
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  editReply(
    options: string | EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    const messageData: EditWebhookMessageSchema =
      typeof options === "string" ? { content: options } : options;

    return this.client.rest.interactions.editOriginalInteractionResponse(
      this.client.user.id,
      this.token,
      messageData,
    );
  }

  /**
   * Deletes the original response to this interaction
   * @returns Promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
   */
  deleteReply(): Promise<void> {
    return this.client.rest.interactions.deleteOriginalInteractionResponse(
      this.client.user.id,
      this.token,
    );
  }

  /**
   * Creates a followup message for this interaction
   * @param options - The message content or options
   * @returns Promise resolving to the created message
   * @remarks
   * - Apps are limited to 5 followup messages per interaction if it was initiated from a user-installed app and isn't installed in the server
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   */
  followUp(options: string | ExecuteWebhookSchema): Promise<MessageEntity> {
    const messageData: ExecuteWebhookSchema =
      typeof options === "string" ? { content: options } : options;

    return this.client.rest.interactions.createFollowupMessage(
      this.client.user.id,
      this.token,
      messageData,
    );
  }

  /**
   * Creates an ephemeral followup message for this interaction
   * @param options - The message content or options
   * @returns Promise resolving to the created message
   * @remarks
   * - This adds the EPHEMERAL flag to the message
   * - Ephemeral messages are only visible to the user who triggered the interaction
   */
  followUpEphemeral(
    options: string | Omit<ExecuteWebhookSchema, "flags">,
  ): Promise<MessageEntity> {
    const messageData: ExecuteWebhookSchema =
      typeof options === "string"
        ? { content: options, flags: MessageFlags.Ephemeral }
        : { ...options, flags: MessageFlags.Ephemeral };

    return this.client.rest.interactions.createFollowupMessage(
      this.client.user.id,
      this.token,
      messageData,
    );
  }

  /**
   * Edits a followup message for this interaction
   * @param messageId - The ID of the followup message
   * @param options - The new message content or options
   * @returns Promise resolving to the updated message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  editFollowUp(
    messageId: Snowflake,
    options: string | EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    const messageData: EditWebhookMessageSchema =
      typeof options === "string" ? { content: options } : options;

    return this.client.rest.interactions.editFollowupMessage(
      this.client.user.id,
      this.token,
      messageId,
      messageData,
    );
  }

  /**
   * Deletes a followup message for this interaction
   * @param messageId - The ID of the followup message
   * @returns Promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
   */
  deleteFollowUp(messageId: Snowflake): Promise<void> {
    return this.client.rest.interactions.deleteFollowupMessage(
      this.client.user.id,
      this.token,
      messageId,
    );
  }
}

/**
 * Base class for interaction types triggered in a guild
 */
export class GuildInteraction<
  T extends GuildInteractionEntity = GuildInteractionEntity,
> extends Interaction<T> {
  override get rawData(): T {
    return super.rawData as T;
  }

  override get guildId(): Snowflake {
    return this.data.guild_id;
  }

  override get member(): GuildMemberEntity {
    return this.data.member;
  }

  /**
   * The Guild's preferred locale, if invoked in a guild
   */
  get guildLocale(): Locale | undefined {
    return this.data.guild_locale;
  }
}

/**
 * Base class for interaction types triggered in a bot DM
 */
export class BotDmInteraction<
  T extends BotDmInteractionEntity = BotDmInteractionEntity,
> extends Interaction<T> {
  override get rawData(): T {
    return super.rawData as T;
  }

  override get user(): User {
    return new User(this.client, this.data.user);
  }
}

/**
 * Base class for interaction types triggered in a private channel
 */
export class PrivateChannelInteraction<
  T extends PrivateChannelInteractionEntity = PrivateChannelInteractionEntity,
> extends Interaction<T> {
  override get rawData(): T {
    return super.rawData as T;
  }

  override get user(): User {
    return new User(this.client, this.data.user);
  }
}

/**
 * Represents a ping interaction
 *
 * Ping interactions are sent by Discord to check if your application is online.
 */
export class PingInteraction extends Interaction<AnyInteractionEntity> {
  /**
   * Responds to the ping interaction
   * @returns Promise that resolves when the response is sent
   */
  async pong(): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.Pong,
    });
  }
}

/**
 * Base class for application command interactions
 */
export class ApplicationCommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  } = AnyInteractionEntity & { data: ApplicationCommandInteractionDataEntity },
> extends Interaction<T> {
  /**
   * The command data for this interaction
   */
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  /**
   * The name of the invoked command
   */
  get name(): string {
    return this.commandData.name;
  }

  /**
   * The ID of the invoked command
   */
  get commandId(): Snowflake {
    return this.commandData.id;
  }

  /**
   * The type of the invoked command
   */
  get commandType(): ApplicationCommandType {
    return this.commandData.type;
  }

  /**
   * Responds to the interaction with a message
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   */
  async reply(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Responds to the interaction with an ephemeral message (only visible to the user)
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   * @remarks
   * - This adds the EPHEMERAL flag to the message
   * - Ephemeral messages are only visible to the user who triggered the interaction
   */
  async replyEphemeral(
    options: string | Partial<Omit<InteractionCallbackMessagesEntity, "flags">>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string"
        ? { content: options, flags: MessageFlags.Ephemeral }
        : { ...options, flags: MessageFlags.Ephemeral };

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Defers the response to the interaction, showing a loading state to the user
   * @param ephemeral - Whether the response should be ephemeral (only visible to the user)
   * @returns Promise that resolves when the deferral is acknowledged
   * @remarks
   * - Use this when your response will take more than 3 seconds
   * - After deferring, use editReply() to send your actual response
   * - Shows a "Bot is thinking..." message to the user
   */
  async deferReply(ephemeral = false): Promise<void> {
    const flags = ephemeral ? MessageFlags.Ephemeral : undefined;

    await this.createResponse({
      type: InteractionCallbackType.DeferredChannelMessageWithSource,
      data: flags ? { flags } : undefined,
    });
  }

  /**
   * Responds to the interaction with a modal
   * @param options - The modal configuration
   * @returns Promise that resolves when the modal is shown
   */
  async showModal(options: InteractionCallbackModalEntity): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.Modal,
      data: options,
    });
  }
}

/**
 * Represents a slash command interaction
 */
export class SlashCommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.ChatInput;
    };
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.ChatInput;
    };
  },
> extends ApplicationCommandInteraction<T> {
  /**
   * The command options passed with this slash command
   */
  get options(): AnyCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  /**
   * Gets a specific option by name
   * @param name - The option name
   * @returns The option value or undefined
   */
  getOption<V = string | number | boolean>(name: string): V | undefined {
    if (!this.options) {
      return undefined;
    }

    // Look at the top level
    const option = this.options.find((opt) => opt.name === name);
    if (option && "value" in option) {
      return option.value as V;
    }

    // Look inside subcommands
    for (const opt of this.options) {
      if (opt.type === ApplicationCommandOptionType.SubCommand && opt.options) {
        const subOption = opt.options.find((subOpt) => subOpt.name === name);
        if (subOption && "value" in subOption) {
          return subOption.value as V;
        }
      }

      // Look inside subcommand groups
      if (
        opt.type === ApplicationCommandOptionType.SubCommandGroup &&
        opt.options
      ) {
        for (const subCmd of opt.options) {
          if (subCmd.options) {
            const subGroupOption = subCmd.options.find(
              (subOpt) => subOpt.name === name,
            );
            if (subGroupOption && "value" in subGroupOption) {
              return subGroupOption.value as V;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Gets the subcommand if this slash command has subcommands
   * @returns The subcommand name or undefined
   */
  getSubcommand(): string | undefined {
    if (!this.options) {
      return undefined;
    }

    // Check for a direct subcommand
    const subcommand = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommand,
    ) as SubCommandOptionEntity | undefined;

    if (subcommand) {
      return subcommand.name;
    }

    // Check for a subcommand inside a group
    const group = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommandGroup,
    ) as SubCommandGroupOptionEntity | undefined;

    if (group && group.options.length > 0) {
      return group.options[0]?.name;
    }

    return undefined;
  }

  /**
   * Gets the subcommand group if this slash command has subcommand groups
   * @returns The subcommand group name or undefined
   */
  getSubcommandGroup(): string | undefined {
    if (!this.options) {
      return undefined;
    }

    const group = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommandGroup,
    ) as SubCommandGroupOptionEntity | undefined;

    if (group) {
      return group.name;
    }

    return undefined;
  }
}

/**
 * Represents a user command interaction
 */
export class UserCommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.User;
    };
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.User;
    };
  },
> extends ApplicationCommandInteraction<T> {
  /**
   * The ID of the targeted user
   */
  get targetId(): Snowflake {
    return this.commandData.target_id as Snowflake;
  }

  /**
   * The targeted user, if resolved
   */
  get targetUser(): User | undefined {
    if (this.commandData.resolved?.users?.[this.targetId]) {
      return new User(
        this.client,
        this.commandData.resolved.users[this.targetId] as UserEntity,
      );
    }
    return undefined;
  }
}

/**
 * Represents a message command interaction
 */
export class MessageCommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.Message;
    };
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity & {
      type: ApplicationCommandType.Message;
    };
  },
> extends ApplicationCommandInteraction<T> {
  /**
   * The ID of the targeted message
   */
  get targetId(): Snowflake {
    return this.commandData.target_id as Snowflake;
  }

  /**
   * The targeted message, if resolved
   */
  get targetMessage(): MessageEntity | undefined {
    if (this.commandData.resolved?.messages?.[this.targetId]) {
      return this.commandData.resolved.messages[this.targetId] as MessageEntity;
    }
    return undefined;
  }
}

/**
 * Represents an autocomplete interaction
 */
export class AutocompleteInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  },
> extends Interaction<T> {
  /**
   * The command data for this interaction
   */
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  /**
   * The name of the command
   */
  get name(): string {
    return this.commandData.name;
  }

  /**
   * The ID of the command
   */
  get commandId(): Snowflake {
    return this.commandData.id;
  }

  /**
   * The command options
   */
  get options(): AnyCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  /**
   * Gets the focused option
   * @returns The focused option or undefined
   */
  getFocusedOption(): AnySimpleCommandOptionEntity | undefined {
    if (!this.options) {
      return undefined;
    }

    // Find the focused option at the top level
    const focusedOption = this.options.find(
      (option) => "focused" in option && option.focused,
    ) as AnySimpleCommandOptionEntity | undefined;

    if (focusedOption) {
      return focusedOption;
    }

    // Look inside subcommands
    for (const option of this.options) {
      if (
        option.type === ApplicationCommandOptionType.SubCommand &&
        option.options
      ) {
        const subFocused = option.options.find(
          (subOpt) => "focused" in subOpt && subOpt.focused,
        ) as AnySimpleCommandOptionEntity | undefined;
        if (subFocused) {
          return subFocused;
        }
      }

      // Look inside subcommand groups
      if (
        option.type === ApplicationCommandOptionType.SubCommandGroup &&
        option.options
      ) {
        for (const subCmd of option.options) {
          if (subCmd.options) {
            const subGroupFocused = subCmd.options.find(
              (subOpt) => "focused" in subOpt && subOpt.focused,
            ) as AnySimpleCommandOptionEntity | undefined;
            if (subGroupFocused) {
              return subGroupFocused;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Responds to the autocomplete interaction with choices
   * @param choices - The autocomplete choices
   * @returns Promise that resolves when the choices are sent
   * @remarks
   * - Maximum of 25 autocomplete choices can be provided
   */
  async autocomplete(
    choices: InteractionCallbackAutocompleteEntity["choices"],
  ): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.ApplicationCommandAutocompleteResult,
      data: { choices },
    });
  }
}

/**
 * Base class for message component interactions
 */
export class MessageComponentInteraction<
  T extends AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity;
  },
> extends Interaction<T> {
  /**
   * The component data for this interaction
   */
  get componentData(): MessageComponentInteractionDataEntity {
    return this.interactionData as MessageComponentInteractionDataEntity;
  }

  /**
   * The custom ID of the component
   */
  get customId(): string {
    return this.componentData.custom_id;
  }

  /**
   * The type of component
   */
  get componentType(): ComponentType {
    return this.componentData.component_type;
  }

  /**
   * The message the component was attached to
   */
  get message(): MessageEntity {
    return this.data.message as MessageEntity;
  }

  /**
   * Defers updating the message for a component interaction
   * @returns Promise that resolves when the deferral is acknowledged
   * @remarks
   * - Use this when your component response will take more than 3 seconds
   * - After deferring, use editReply() to send your actual update
   * - Does NOT show a "Bot is thinking..." message to the user
   */
  async deferUpdate(): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.DeferredUpdateMessage,
    });
  }

  /**
   * Updates the message that contains the component
   * @param options - The new message content or options
   * @returns Promise that resolves when the message is updated
   * @remarks
   * - Updates the original message instead of sending a new one
   */
  async updateMessage(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.UpdateMessage,
      data: messageData,
    });
  }

  /**
   * Responds to the interaction with a message
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   */
  async reply(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Responds to the interaction with an ephemeral message (only visible to the user)
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   * @remarks
   * - This adds the EPHEMERAL flag to the message
   * - Ephemeral messages are only visible to the user who triggered the interaction
   */
  async replyEphemeral(
    options: string | Partial<Omit<InteractionCallbackMessagesEntity, "flags">>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string"
        ? { content: options, flags: MessageFlags.Ephemeral }
        : { ...options, flags: MessageFlags.Ephemeral };

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Defers the response to the interaction, showing a loading state to the user
   * @param ephemeral - Whether the response should be ephemeral (only visible to the user)
   * @returns Promise that resolves when the deferral is acknowledged
   * @remarks
   * - Use this when your response will take more than 3 seconds
   * - After deferring, use editReply() to send your actual response
   * - Shows a "Bot is thinking..." message to the user
   */
  async deferReply(ephemeral = false): Promise<void> {
    const flags = ephemeral ? MessageFlags.Ephemeral : undefined;

    await this.createResponse({
      type: InteractionCallbackType.DeferredChannelMessageWithSource,
      data: flags ? { flags } : undefined,
    });
  }

  /**
   * Responds to the interaction with a modal
   * @param options - The modal configuration
   * @returns Promise that resolves when the modal is shown
   */
  async showModal(options: InteractionCallbackModalEntity): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.Modal,
      data: options,
    });
  }
}

/**
 * Represents a button interaction
 */
export class ButtonInteraction<
  T extends AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity & {
      component_type: ComponentType.Button;
    };
  } = AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity & {
      component_type: ComponentType.Button;
    };
  },
> extends MessageComponentInteraction<T> {
  override get componentType(): ComponentType.Button {
    return ComponentType.Button;
  }
}

/**
 * Base class for select menu interactions
 */
export class SelectMenuInteraction<
  T extends AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity & { values: string[] };
  } = AnyInteractionEntity & {
    data: MessageComponentInteractionDataEntity & { values: string[] };
  },
> extends MessageComponentInteraction<T> {
  /**
   * The values selected in the select menu
   */
  get values(): SelectMenuOptionEntity[] {
    return this.componentData.values || [];
  }
}

/**
 * Represents a string select menu interaction
 */
export class StringSelectMenuInteraction extends SelectMenuInteraction {
  override get componentType(): ComponentType.StringSelect {
    return ComponentType.StringSelect;
  }
}

/**
 * Represents a user select menu interaction
 */
export class UserSelectMenuInteraction extends SelectMenuInteraction {
  override get componentType(): ComponentType.UserSelect {
    return ComponentType.UserSelect;
  }

  /**
   * The resolved users from the selection
   */
  get resolvedUsers(): Record<Snowflake, User> | undefined {
    if (!this.componentData.resolved?.users) {
      return undefined;
    }

    const users: Record<Snowflake, User> = {};
    for (const [id, userData] of Object.entries(
      this.componentData.resolved.users,
    )) {
      users[id] = new User(this.client, userData);
    }
    return users;
  }
}

/**
 * Represents a role select menu interaction
 */
export class RoleSelectMenuInteraction extends SelectMenuInteraction {
  override get componentType(): ComponentType.RoleSelect {
    return ComponentType.RoleSelect;
  }

  /**
   * The resolved roles from the selection
   */
  get resolvedRoles() {
    return this.componentData.resolved?.roles;
  }
}

/**
 * Represents a channel select menu interaction
 */
export class ChannelSelectMenuInteraction extends SelectMenuInteraction {
  override get componentType(): ComponentType.ChannelSelect {
    return ComponentType.ChannelSelect;
  }

  /**
   * The resolved channels from the selection
   */
  get resolvedChannels() {
    return this.componentData.resolved?.channels;
  }
}

/**
 * Represents a mentionable select menu interaction
 */
export class MentionableSelectMenuInteraction extends SelectMenuInteraction {
  override get componentType(): ComponentType.MentionableSelect {
    return ComponentType.MentionableSelect;
  }

  /**
   * The resolved users from the selection
   */
  get resolvedUsers(): Record<Snowflake, User> | undefined {
    if (!this.componentData.resolved?.users) {
      return undefined;
    }

    const users: Record<Snowflake, User> = {};
    for (const [id, userData] of Object.entries(
      this.componentData.resolved.users,
    )) {
      users[id] = new User(this.client, userData);
    }
    return users;
  }

  /**
   * The resolved roles from the selection
   */
  get resolvedRoles() {
    return this.componentData.resolved?.roles;
  }
}

/**
 * Represents a modal submission interaction
 */
export class ModalSubmitInteraction<
  T extends AnyInteractionEntity & {
    data: ModalSubmitInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ModalSubmitInteractionDataEntity;
  },
> extends Interaction<T> {
  /**
   * The modal data for this interaction
   */
  get modalData(): ModalSubmitInteractionDataEntity {
    return this.interactionData as ModalSubmitInteractionDataEntity;
  }

  /**
   * The custom ID of the modal
   */
  get customId(): string {
    return this.modalData.custom_id;
  }

  /**
   * The components submitted with the modal
   */
  get components(): ActionRowEntity[] {
    return this.modalData.components;
  }

  /**
   * Gets a specific value from the modal by custom ID
   * @param customId - The custom ID of the component
   * @returns The component value or undefined
   */
  getField(customId: string): string | undefined {
    if (!this.components) {
      return undefined;
    }

    for (const row of this.components) {
      for (const component of row.components) {
        if (component.custom_id === customId && "value" in component) {
          return component.value;
        }
      }
    }

    return undefined;
  }

  /**
   * Responds to the interaction with a message
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   */
  async reply(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Responds to the interaction with an ephemeral message (only visible to the user)
   * @param options - The message content or options
   * @returns Promise that resolves when the response is sent
   * @remarks
   * - This adds the EPHEMERAL flag to the message
   * - Ephemeral messages are only visible to the user who triggered the interaction
   */
  async replyEphemeral(
    options: string | Partial<Omit<InteractionCallbackMessagesEntity, "flags">>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string"
        ? { content: options, flags: MessageFlags.Ephemeral }
        : { ...options, flags: MessageFlags.Ephemeral };

    await this.createResponse({
      type: InteractionCallbackType.ChannelMessageWithSource,
      data: messageData,
    });
  }

  /**
   * Defers the response to the interaction, showing a loading state to the user
   * @param ephemeral - Whether the response should be ephemeral (only visible to the user)
   * @returns Promise that resolves when the deferral is acknowledged
   * @remarks
   * - Use this when your response will take more than 3 seconds
   * - After deferring, use editReply() to send your actual response
   * - Shows a "Bot is thinking..." message to the user
   */
  async deferReply(ephemeral = false): Promise<void> {
    const flags = ephemeral ? MessageFlags.Ephemeral : undefined;

    await this.createResponse({
      type: InteractionCallbackType.DeferredChannelMessageWithSource,
      data: flags ? { flags } : undefined,
    });
  }
}

// Export all interaction types as a union type for easier use
export type AnyInteraction =
  | PingInteraction
  | ApplicationCommandInteraction
  | SlashCommandInteraction
  | UserCommandInteraction
  | MessageCommandInteraction
  | MessageComponentInteraction
  | ButtonInteraction
  | SelectMenuInteraction
  | StringSelectMenuInteraction
  | UserSelectMenuInteraction
  | RoleSelectMenuInteraction
  | ChannelSelectMenuInteraction
  | MentionableSelectMenuInteraction
  | AutocompleteInteraction
  | ModalSubmitInteraction;
