import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AnyInteractionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandType,
  ChannelType,
  ComponentType,
  type DmChannelEntity,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildDirectoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  InteractionType,
  type MessageComponentInteractionDataEntity,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
} from "@nyxojs/core";
import {
  AnnouncementThreadChannel,
  type AnyChannel,
  type AnyInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  ComponentInteraction,
  DmChannel,
  GroupDmChannel,
  GuildAnnouncementChannel,
  GuildCategoryChannel,
  GuildDirectoryChannel,
  GuildForumChannel,
  GuildMediaChannel,
  GuildStageVoiceChannel,
  GuildTextChannel,
  GuildVoiceChannel,
  Interaction,
  MessageCommandInteraction,
  ModalSubmitInteraction,
  PingInteraction,
  PrivateThreadChannel,
  PublicThreadChannel,
  SelectMenuInteraction,
  SlashCommandInteraction,
  UserCommandInteraction,
} from "../classes/index.js";
import type { Client } from "../core/index.js";

/**
 * Creates and returns the appropriate channel instance based on the provided channel data.
 *
 * This function acts as a factory for channel objects, analyzing the type property
 * of the provided data and instantiating the corresponding channel class.
 *
 * @param client - The client instance used to create the channel
 * @param data - The channel entity data received from Discord API
 * @returns An instance of the appropriate channel class that corresponds to the channel type
 *
 * @throws {Error} If the channel type is not recognized or supported
 */
export function channelFactory(
  client: Client,
  data: AnyChannelEntity,
): AnyChannel {
  // Determine which channel class to instantiate based on the channel type
  switch (data.type) {
    case ChannelType.Dm:
      return new DmChannel(client, data as DmChannelEntity);

    case ChannelType.GroupDm:
      return new GroupDmChannel(client, data as GroupDmChannelEntity);

    case ChannelType.GuildText:
      return new GuildTextChannel(client, data as GuildTextChannelEntity);

    case ChannelType.GuildVoice:
      return new GuildVoiceChannel(client, data as GuildVoiceChannelEntity);

    case ChannelType.GuildCategory:
      return new GuildCategoryChannel(
        client,
        data as GuildCategoryChannelEntity,
      );

    case ChannelType.GuildAnnouncement:
      return new GuildAnnouncementChannel(
        client,
        data as GuildAnnouncementChannelEntity,
      );

    case ChannelType.PublicThread:
      return new PublicThreadChannel(client, data as PublicThreadChannelEntity);

    case ChannelType.PrivateThread:
      return new PrivateThreadChannel(
        client,
        data as PrivateThreadChannelEntity,
      );

    case ChannelType.AnnouncementThread:
      return new AnnouncementThreadChannel(
        client,
        data as AnnouncementThreadChannelEntity,
      );

    case ChannelType.GuildStageVoice:
      return new GuildStageVoiceChannel(
        client,
        data as GuildStageVoiceChannelEntity,
      );

    case ChannelType.GuildForum:
      return new GuildForumChannel(client, data as GuildForumChannelEntity);

    case ChannelType.GuildMedia:
      return new GuildMediaChannel(client, data as GuildMediaChannelEntity);

    case ChannelType.GuildDirectory:
      return new GuildDirectoryChannel(
        client,
        data as GuildDirectoryChannelEntity,
      );

    default:
      throw new Error(
        "Unknown channel. Please check the channel type and try again.",
      );
  }
}

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
