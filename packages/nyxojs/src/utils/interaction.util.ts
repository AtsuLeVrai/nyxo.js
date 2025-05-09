import {
  type AnyInteractionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
  type MessageComponentInteractionDataEntity,
} from "@nyxojs/core";
import {
  type AnyInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  ComponentInteraction,
  Interaction,
  MessageCommandInteraction,
  ModalSubmitInteraction,
  PingInteraction,
  SelectMenuInteraction,
  SlashCommandInteraction,
  UserCommandInteraction,
} from "../classes/index.js";
import type { Client } from "../core/index.js";

/**
 * Creates and returns the appropriate interaction instance based on the provided interaction data.
 *
 * This function acts as a factory for interaction objects, analyzing the type property
 * and data of the provided interaction and instantiating the corresponding interaction class.
 *
 * @param client - The client instance used to create the interaction
 * @param data - The interaction entity data received from Discord API
 * @returns An instance of the appropriate interaction class that corresponds to the interaction type
 *
 * @throws {Error} If the interaction type is not recognized or supported
 */
export function interactionFactory(
  client: Client,
  data: AnyInteractionEntity,
): AnyInteraction {
  // First, determine the primary interaction type
  switch (data.type) {
    case InteractionType.Ping:
      return new PingInteraction(client, data);

    case InteractionType.ApplicationCommand: {
      // For application commands, we need to check the command type
      if (data.data) {
        const commandData =
          data.data as ApplicationCommandInteractionDataEntity;

        switch (commandData.type) {
          case ApplicationCommandType.ChatInput:
            return new SlashCommandInteraction(client, data);

          case ApplicationCommandType.User:
            return new UserCommandInteraction(client, data);

          case ApplicationCommandType.Message:
            return new MessageCommandInteraction(client, data);

          default:
            // If we don't recognize the specific command type, fall back to the base CommandInteraction
            return new CommandInteraction(client, data);
        }
      }
      // If no data is available, fall back to the base CommandInteraction
      return new CommandInteraction(client, data);
    }

    case InteractionType.MessageComponent: {
      // For message components, we need to check the component type
      if (data.data) {
        const componentData =
          data.data as MessageComponentInteractionDataEntity;

        switch (componentData.component_type) {
          case ComponentType.Button:
            return new ButtonInteraction(client, data);

          case ComponentType.StringSelect:
          case ComponentType.UserSelect:
          case ComponentType.RoleSelect:
          case ComponentType.MentionableSelect:
          case ComponentType.ChannelSelect:
            return new SelectMenuInteraction(client, data);

          default:
            // If we don't recognize the specific component type, fall back to the base ComponentInteraction
            return new ComponentInteraction(client, data);
        }
      }
      // If no data is available, fall back to the base ComponentInteraction
      return new ComponentInteraction(client, data);
    }

    case InteractionType.ApplicationCommandAutocomplete:
      return new AutocompleteInteraction(client, data);

    case InteractionType.ModalSubmit:
      return new ModalSubmitInteraction(client, data);

    default:
      // If we don't recognize the interaction type, fall back to the base Interaction
      // This ensures we always return an interaction object even for future, unknown types
      return new Interaction(client, data);
  }
}
