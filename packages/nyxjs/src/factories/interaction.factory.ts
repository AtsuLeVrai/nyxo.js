import {
  type AnyInteractionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
  type MessageComponentInteractionDataEntity,
} from "@nyxjs/core";
import {
  type AnyInteraction,
  ApplicationCommandInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  MessageCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  PingInteraction,
  RoleSelectMenuInteraction,
  SlashCommandInteraction,
  StringSelectMenuInteraction,
  UserCommandInteraction,
  UserSelectMenuInteraction,
} from "../classes/index.js";
import type { Client } from "../core/index.js";

/**
 * Factory class for creating interaction instances based on their type.
 *
 * This factory handles the creation of appropriate interaction class instances
 * by examining the interaction type in the provided data, as well as subtypes
 * like command type and component type.
 */
export const InteractionFactory = {
  /**
   * Creates an interaction instance of the appropriate type based on the interaction data.
   *
   * @param client - The client instance to pass to the interaction
   * @param data - The interaction data containing the type and other properties
   * @returns An instance of the appropriate interaction class
   * @throws Error if the interaction type is not supported
   */
  create(client: Client, data: AnyInteractionEntity): AnyInteraction {
    switch (data.type) {
      case InteractionType.Ping:
        return new PingInteraction(client, data);

      case InteractionType.ApplicationCommand: {
        const commandData =
          data.data as ApplicationCommandInteractionDataEntity;
        switch (commandData.type) {
          case ApplicationCommandType.ChatInput:
            // @ts-expect-error: problem with the type `data`
            return new SlashCommandInteraction(client, data);

          case ApplicationCommandType.User:
            // @ts-expect-error: problem with the type `data`
            return new UserCommandInteraction(client, data);

          case ApplicationCommandType.Message:
            // @ts-expect-error: problem with the type `data`
            return new MessageCommandInteraction(client, data);

          default:
            // @ts-expect-error: problem with the type `data`
            return new ApplicationCommandInteraction(client, data);
        }
      }

      case InteractionType.MessageComponent: {
        const componentData =
          data.data as MessageComponentInteractionDataEntity;
        switch (componentData.component_type) {
          case ComponentType.Button:
            // @ts-expect-error: problem with the type `data`
            return new ButtonInteraction(client, data);

          case ComponentType.StringSelect:
            // @ts-expect-error: problem with the type `data`
            return new StringSelectMenuInteraction(client, data);

          case ComponentType.UserSelect:
            // @ts-expect-error: problem with the type `data`
            return new UserSelectMenuInteraction(client, data);

          case ComponentType.RoleSelect:
            // @ts-expect-error: problem with the type `data`
            return new RoleSelectMenuInteraction(client, data);

          case ComponentType.MentionableSelect:
            // @ts-expect-error: problem with the type `data`
            return new MentionableSelectMenuInteraction(client, data);

          case ComponentType.ChannelSelect:
            // @ts-expect-error: problem with the type `data`
            return new ChannelSelectMenuInteraction(client, data);

          default:
            // @ts-expect-error: problem with the type `data`
            return new MessageComponentInteraction(client, data);
        }
      }

      case InteractionType.ApplicationCommandAutocomplete:
        // @ts-expect-error: problem with the type `data`
        return new AutocompleteInteraction(client, data);

      case InteractionType.ModalSubmit:
        // @ts-expect-error: problem with the type `data`
        return new ModalSubmitInteraction(client, data);

      default:
        throw new Error(`Unsupported interaction type: ${data.type}`);
    }
  },

  /**
   * Determines if the interaction can be safely cast to a specific type
   * @param interaction - The interaction to check
   * @param type - The interaction type to compare against
   * @returns True if the interaction is of the specified type
   */
  isType(interaction: AnyInteraction, type: InteractionType): boolean {
    return interaction.type === type;
  },

  /**
   * Checks if an interaction is a ping interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is a ping interaction
   */
  isPing(interaction: AnyInteraction): interaction is PingInteraction {
    return interaction.type === InteractionType.Ping;
  },

  /**
   * Checks if an interaction is an application command
   * @param interaction - The interaction to check
   * @returns True if the interaction is an application command
   */
  isApplicationCommand(
    interaction: AnyInteraction,
  ): interaction is ApplicationCommandInteraction {
    return interaction.type === InteractionType.ApplicationCommand;
  },

  /**
   * Checks if an interaction is a slash command
   * @param interaction - The interaction to check
   * @returns True if the interaction is a slash command
   */
  isSlashCommand(
    interaction: AnyInteraction,
  ): interaction is SlashCommandInteraction {
    return (
      interaction.type === InteractionType.ApplicationCommand &&
      (interaction.interactionData as ApplicationCommandInteractionDataEntity)
        ?.type === ApplicationCommandType.ChatInput
    );
  },

  /**
   * Checks if an interaction is a user command
   * @param interaction - The interaction to check
   * @returns True if the interaction is a user command
   */
  isUserCommand(
    interaction: AnyInteraction,
  ): interaction is UserCommandInteraction {
    return (
      interaction.type === InteractionType.ApplicationCommand &&
      (interaction.interactionData as ApplicationCommandInteractionDataEntity)
        ?.type === ApplicationCommandType.User
    );
  },

  /**
   * Checks if an interaction is a message command
   * @param interaction - The interaction to check
   * @returns True if the interaction is a message command
   */
  isMessageCommand(
    interaction: AnyInteraction,
  ): interaction is MessageCommandInteraction {
    return (
      interaction.type === InteractionType.ApplicationCommand &&
      (interaction.interactionData as ApplicationCommandInteractionDataEntity)
        ?.type === ApplicationCommandType.Message
    );
  },

  /**
   * Checks if an interaction is an autocomplete interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is an autocomplete interaction
   */
  isAutocomplete(
    interaction: AnyInteraction,
  ): interaction is AutocompleteInteraction {
    return interaction.type === InteractionType.ApplicationCommandAutocomplete;
  },

  /**
   * Checks if an interaction is a message component interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is a message component interaction
   */
  isMessageComponent(
    interaction: AnyInteraction,
  ): interaction is MessageComponentInteraction {
    return interaction.type === InteractionType.MessageComponent;
  },

  /**
   * Checks if an interaction is a button interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is a button interaction
   */
  isButton(interaction: AnyInteraction): interaction is ButtonInteraction {
    return (
      interaction.type === InteractionType.MessageComponent &&
      (interaction.interactionData as MessageComponentInteractionDataEntity)
        ?.component_type === ComponentType.Button
    );
  },

  /**
   * Checks if an interaction is a select menu interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is a select menu interaction
   */
  isSelectMenu(
    interaction: AnyInteraction,
  ): interaction is
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | MentionableSelectMenuInteraction {
    if (interaction.type !== InteractionType.MessageComponent) {
      return false;
    }

    const componentType = (
      interaction.interactionData as MessageComponentInteractionDataEntity
    )?.component_type;

    return (
      componentType === ComponentType.StringSelect ||
      componentType === ComponentType.UserSelect ||
      componentType === ComponentType.RoleSelect ||
      componentType === ComponentType.MentionableSelect ||
      componentType === ComponentType.ChannelSelect
    );
  },

  /**
   * Checks if an interaction is a modal submit interaction
   * @param interaction - The interaction to check
   * @returns True if the interaction is a modal submit interaction
   */
  isModalSubmit(
    interaction: AnyInteraction,
  ): interaction is ModalSubmitInteraction {
    return interaction.type === InteractionType.ModalSubmit;
  },
} as const;
