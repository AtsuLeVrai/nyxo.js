import {
  type AnyInteractionCommandOptionEntity,
  type AnyInteractionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type Snowflake,
  type SubCommandGroupOptionEntity,
  type SubCommandOptionEntity,
  type UserEntity,
} from "@nyxjs/core";
import type { MessageCreateEntity } from "@nyxjs/gateway";
import { Message } from "../messages/index.js";
import { User } from "../users/index.js";
import { Interaction } from "./interaction.class.js";

// TODO: Add EnforceCamelCase implementation
export class CommandInteraction<
  T extends AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  } = AnyInteractionEntity & {
    data: ApplicationCommandInteractionDataEntity;
  },
> extends Interaction<T> {
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  get name(): string {
    return this.commandData.name;
  }

  get commandId(): Snowflake {
    return this.commandData.id;
  }

  get commandType(): ApplicationCommandType {
    return this.commandData.type;
  }

  get options(): AnyInteractionCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  isSlashCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.ChatInput;
  }

  isUserCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.User;
  }

  isMessageCommand(this: CommandInteraction): this is CommandInteraction {
    return this.commandType === ApplicationCommandType.Message;
  }

  getOption<V = string | number | boolean>(name: string): V | undefined {
    if (!this.options) {
      return undefined;
    }

    const option = this.options.find((opt) => opt.name === name);
    if (option && "value" in option) {
      return option.value as V;
    }

    for (const opt of this.options) {
      if (opt.type === ApplicationCommandOptionType.SubCommand && opt.options) {
        const subOption = opt.options.find((subOpt) => subOpt.name === name);
        if (subOption && "value" in subOption) {
          return subOption.value as V;
        }
      }

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

  getSubcommand(): string | undefined {
    if (!(this.isSlashCommand() && this.options)) {
      return undefined;
    }

    const subcommand = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommand,
    ) as SubCommandOptionEntity | undefined;

    if (subcommand) {
      return subcommand.name;
    }

    const group = this.options.find(
      (opt) => opt.type === ApplicationCommandOptionType.SubCommandGroup,
    ) as SubCommandGroupOptionEntity | undefined;

    if (group && group.options.length > 0) {
      return group.options[0]?.name;
    }

    return undefined;
  }

  getSubcommandGroup(): string | undefined {
    if (!(this.isSlashCommand() && this.options)) {
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

  getTargetUser(): User | undefined {
    if (!(this.isUserCommand() && this.commandData.target_id)) {
      return undefined;
    }

    const targetId = this.commandData.target_id;
    if (this.commandData.resolved?.users?.[targetId]) {
      return new User(
        this.client,
        this.commandData.resolved.users[targetId] as UserEntity,
      );
    }

    return undefined;
  }

  getTargetMessage(): Message | undefined {
    if (!(this.isMessageCommand() && this.commandData.target_id)) {
      return undefined;
    }

    const targetId = this.commandData.target_id;
    if (this.commandData.resolved?.messages?.[targetId]) {
      return new Message(
        this.client,
        this.commandData.resolved.messages[targetId] as MessageCreateEntity,
      );
    }
    return undefined;
  }
}
