import {
  type AnyInteractionEntity,
  ApplicationCommandType,
  type BotDmInteractionEntity,
  type GuildInteractionEntity,
  InteractionContextType,
  InteractionType,
  type PrivateChannelInteractionEntity,
} from "@nyxojs/core";
import {
  type AnyInteraction,
  AutocompleteInteraction,
  CommandInteraction,
  ComponentInteraction,
  GuildInteraction,
  ModalSubmitInteraction,
  PrivateInteraction,
} from "../classes/index.js";
import type { Client } from "../core/index.js";

/**
 * Factory for creating and identifying interaction instances based on their types.
 *
 * This factory handles the creation of appropriate interaction class instances
 * by examining the interaction data, including type, context, and subtypes.
 */
export const InteractionFactory = {
  /**
   * Creates an interaction instance of the appropriate type based on the interaction data.
   *
   * @param client - The client instance to pass to the interaction
   * @param data - The interaction data containing the type and other properties
   * @returns An instance of the appropriate interaction class
   * @throws {Error} Error if the interaction type is not supported
   */
  create(client: Client, data: AnyInteractionEntity): AnyInteraction {
    // First determine the context (guild vs private)
    if (data.context === InteractionContextType.Guild) {
      return new GuildInteraction(client, data as GuildInteractionEntity);
    }

    if (
      data.context === InteractionContextType.BotDm ||
      data.context === InteractionContextType.PrivateChannel
    ) {
      return new PrivateInteraction(
        client,
        data as BotDmInteractionEntity | PrivateChannelInteractionEntity,
      );
    }

    // @ts-expect-error: If context isn't defined, proceed based on interaction type
    switch (data.type) {
      case InteractionType.ApplicationCommand:
        return new CommandInteraction(client, data);

      case InteractionType.MessageComponent:
        return new ComponentInteraction(client, data);

      case InteractionType.ApplicationCommandAutocomplete:
        return new AutocompleteInteraction(client, data);

      case InteractionType.ModalSubmit:
        return new ModalSubmitInteraction(client, data);

      case InteractionType.Ping: {
        // Handle ping interactions with a special method
        // but we need a base interaction instance for ping
        return new GuildInteraction(client, data as GuildInteractionEntity);
      }

      default:
        throw new Error("Unsupported interaction type");
    }
  },

  /**
   * Determines if the interaction is from a guild context
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is from a guild
   */
  isGuildInteraction(
    interaction: AnyInteraction,
  ): interaction is GuildInteraction {
    return interaction.context === InteractionContextType.Guild;
  },

  /**
   * Determines if the interaction is from a private message context
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is from a private message
   */
  isPrivateInteraction(
    interaction: AnyInteraction,
  ): interaction is PrivateInteraction {
    return (
      interaction.context === InteractionContextType.BotDm ||
      interaction.context === InteractionContextType.PrivateChannel
    );
  },

  /**
   * Determines if the interaction is a command interaction
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a command
   */
  isCommand(interaction: AnyInteraction): interaction is CommandInteraction {
    return interaction.type === InteractionType.ApplicationCommand;
  },

  /**
   * Determines if the interaction is a slash command
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a slash command
   */
  isSlashCommand(
    interaction: AnyInteraction,
  ): interaction is CommandInteraction {
    if (!this.isCommand(interaction)) {
      return false;
    }

    return interaction.commandType === ApplicationCommandType.ChatInput;
  },

  /**
   * Determines if the interaction is a user command
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a user command
   */
  isUserCommand(
    interaction: AnyInteraction,
  ): interaction is CommandInteraction {
    if (!this.isCommand(interaction)) {
      return false;
    }

    return interaction.commandType === ApplicationCommandType.User;
  },

  /**
   * Determines if the interaction is a message command
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a message command
   */
  isMessageCommand(
    interaction: AnyInteraction,
  ): interaction is CommandInteraction {
    if (!this.isCommand(interaction)) {
      return false;
    }

    return interaction.commandType === ApplicationCommandType.Message;
  },

  /**
   * Determines if the interaction is an autocomplete interaction
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is an autocomplete interaction
   */
  isAutocomplete(
    interaction: AnyInteraction,
  ): interaction is AutocompleteInteraction {
    return interaction.type === InteractionType.ApplicationCommandAutocomplete;
  },

  /**
   * Determines if the interaction is a component interaction
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a component interaction
   */
  isComponent(
    interaction: AnyInteraction,
  ): interaction is ComponentInteraction {
    return interaction.type === InteractionType.MessageComponent;
  },

  /**
   * Determines if the interaction is a modal submit
   *
   * @param interaction - The interaction to check
   * @returns True if the interaction is a modal submit
   */
  isModalSubmit(
    interaction: AnyInteraction,
  ): interaction is ModalSubmitInteraction {
    return interaction.type === InteractionType.ModalSubmit;
  },
} as const;
