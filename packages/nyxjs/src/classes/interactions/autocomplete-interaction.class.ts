import {
  type AnyCommandOptionEntity,
  type AnyInteractionEntity,
  type AnySimpleCommandOptionEntity,
  type ApplicationCommandInteractionDataEntity,
  ApplicationCommandOptionType,
  type InteractionCallbackAutocompleteEntity,
  InteractionCallbackType,
  type Snowflake,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Interaction } from "./interaction.class.js";

export class AutocompleteInteraction<
    T extends AnyInteractionEntity & {
      data: ApplicationCommandInteractionDataEntity;
    } = AnyInteractionEntity & {
      data: ApplicationCommandInteractionDataEntity;
    },
  >
  extends Interaction<T>
  implements
    EnforceCamelCase<
      AnyInteractionEntity & {
        data: ApplicationCommandInteractionDataEntity;
      }
    >
{
  get commandData(): ApplicationCommandInteractionDataEntity {
    return this.interactionData as ApplicationCommandInteractionDataEntity;
  }

  get name(): string {
    return this.commandData.name;
  }

  get commandId(): Snowflake {
    return this.commandData.id;
  }

  get options(): AnyCommandOptionEntity[] | undefined {
    return this.commandData.options;
  }

  getFocusedOption(): AnySimpleCommandOptionEntity | undefined {
    if (!this.options) {
      return undefined;
    }

    const focusedOption = this.options.find(
      (option) => "focused" in option && option.focused,
    ) as AnySimpleCommandOptionEntity | undefined;

    if (focusedOption) {
      return focusedOption;
    }

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

  async autocomplete(
    choices: InteractionCallbackAutocompleteEntity["choices"],
  ): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.ApplicationCommandAutocompleteResult,
      data: { choices },
    });
  }
}
