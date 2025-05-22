import {
  APPLICATION_COMMAND_NAME_REGEX,
  ApplicationCommandEntryPointType,
  ApplicationCommandType,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { COMMAND_LIMITS } from "../utils/index.js";
import { ApplicationCommandOptionSchema } from "./command-option.schema.js";

/**
 * Base schema for all application commands, containing common properties.
 * This serves as the foundation for specific command type schemas.
 */
export const BaseCommandSchema = z.object({
  /**
   * Command type that defines how users interact with the command.
   */
  type: z.enum(ApplicationCommandType),

  /**
   * Name of the command, 1-32 characters.
   * Must follow Discord's naming conventions.
   */
  name: z
    .string()
    .min(1)
    .max(COMMAND_LIMITS.NAME)
    .refine(
      (name) => {
        // Slash commands must use lowercase names
        const nameToValidate = ApplicationCommandType.ChatInput
          ? name.toLowerCase()
          : name;
        return APPLICATION_COMMAND_NAME_REGEX.test(nameToValidate);
      },
      {
        message:
          "Command name must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
      },
    ),

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   */
  name_localizations: z
    .record(z.string(), z.string().min(1).max(COMMAND_LIMITS.NAME))
    .optional()
    .nullable(),

  /**
   * Description for CHAT_INPUT commands, 1-100 characters.
   * Empty string for USER and MESSAGE commands.
   */
  description: z.string().max(COMMAND_LIMITS.DESCRIPTION),

  /**
   * Localization dictionary for the description field.
   * Values follow the same restrictions as description.
   */
  description_localizations: z
    .record(z.string(), z.string().max(COMMAND_LIMITS.DESCRIPTION))
    .optional()
    .nullable(),

  /**
   * Set of permissions represented as a bit set.
   * Controls which users can use the command by default.
   */
  default_member_permissions: z.string().nullable().optional(),

  /**
   * Whether the command is age-restricted.
   * Limits who can see and access the command.
   */
  nsfw: z.boolean().optional(),

  /**
   * Whether the command is available in DMs with the app.
   * Only for globally-scoped commands.
   * @deprecated Use contexts instead.
   */
  dm_permission: z.boolean().optional(),

  /**
   * Whether the command is enabled by default when the app is added to a guild.
   * @deprecated Replaced by default_member_permissions.
   */
  default_permission: z.boolean().optional(),
});

/**
 * Schema specifically for global commands, which can include additional properties.
 */
export const GlobalCommandSchema = BaseCommandSchema.extend({
  /**
   * Installation contexts where the command is available.
   * Controls where users can access the command.
   */
  integration_types: z.array(z.number().int().nonnegative()).optional(),

  /**
   * Interaction contexts where the command can be used.
   * Defines UI locations where the command appears.
   */
  contexts: z.array(z.number().int().nonnegative()).optional(),
});

/**
 * Schema for CHAT_INPUT (slash) commands.
 */
export const ChatInputCommandSchema = BaseCommandSchema.extend({
  /**
   * Type must be CHAT_INPUT (1) for slash commands.
   */
  type: z.literal(ApplicationCommandType.ChatInput),

  /**
   * Description is required for CHAT_INPUT commands.
   */
  description: z.string().min(1).max(COMMAND_LIMITS.DESCRIPTION),

  /**
   * Parameters for the command, max of 25.
   */
  options: z
    .array(ApplicationCommandOptionSchema)
    .max(COMMAND_LIMITS.OPTIONS)
    .optional(),
});

/**
 * Schema for USER commands (context menu on users).
 */
export const UserCommandSchema = BaseCommandSchema.extend({
  /**
   * Type must be USER (2) for user context menu commands.
   */
  type: z.literal(ApplicationCommandType.User),

  /**
   * Description must be empty for USER commands.
   */
  description: z.literal(""),
});

/**
 * Schema for MESSAGE commands (context menu on messages).
 */
export const MessageCommandSchema = BaseCommandSchema.extend({
  /**
   * Type must be MESSAGE (3) for message context menu commands.
   */
  type: z.literal(ApplicationCommandType.Message),

  /**
   * Description must be empty for MESSAGE commands.
   */
  description: z.literal(""),
});

/**
 * Schema for PRIMARY_ENTRY_POINT commands (app launcher).
 */
export const EntryPointCommandSchema = BaseCommandSchema.extend({
  /**
   * Type must be PRIMARY_ENTRY_POINT (4) for entry point commands.
   */
  type: z.literal(ApplicationCommandType.PrimaryEntryPoint),

  /**
   * Description is required for ENTRY_POINT commands.
   */
  description: z.string().min(1).max(COMMAND_LIMITS.DESCRIPTION),

  /**
   * Handler determines how the interaction is handled.
   */
  handler: z.enum(ApplicationCommandEntryPointType),
});

/**
 * Discriminated union of all command type schemas.
 * Used to validate commands based on their type.
 */
export const ApplicationCommandSchema = z
  .discriminatedUnion("type", [
    ChatInputCommandSchema,
    UserCommandSchema,
    MessageCommandSchema,
    EntryPointCommandSchema,
  ])
  .refine(
    (data) => {
      // Calculate total character count
      let charCount = data.name.length + data.description.length;

      // Count characters in options if present
      if (
        "options" in data &&
        data.options &&
        data.type === ApplicationCommandType.ChatInput
      ) {
        for (const option of data.options) {
          charCount += option.name.length + option.description.length;

          // Count characters in choices
          if ("choices" in option && option.choices) {
            for (const choice of option.choices) {
              charCount += choice.name.length;
              if (typeof choice.value === "string") {
                charCount += choice.value.length;
              }
            }
          }

          // Count characters in subcommand options
          if (option.type === 1 && option.options) {
            for (const subOption of option.options) {
              charCount += subOption.name.length + subOption.description.length;

              // Count characters in choices
              if ("choices" in subOption && subOption.choices) {
                for (const choice of subOption.choices) {
                  charCount += choice.name.length;
                  if (typeof choice.value === "string") {
                    charCount += choice.value.length;
                  }
                }
              }
            }
          }

          // Count characters in subcommand group options
          if (option.type === 2 && option.options) {
            for (const subCommand of option.options) {
              charCount +=
                subCommand.name.length + subCommand.description.length;

              if (subCommand.options) {
                for (const subOption of subCommand.options) {
                  charCount +=
                    subOption.name.length + subOption.description.length;

                  // Count characters in choices
                  if ("choices" in subOption && subOption.choices) {
                    for (const choice of subOption.choices) {
                      charCount += choice.name.length;
                      if (typeof choice.value === "string") {
                        charCount += choice.value.length;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return charCount <= COMMAND_LIMITS.TOTAL_LENGTH;
    },
    {
      message: `Command exceeds maximum total character limit (${COMMAND_LIMITS.TOTAL_LENGTH})`,
      path: ["_all"],
    },
  );
