import {
  APPLICATION_COMMAND_NAME_REGEX,
  type AnyApplicationCommandOptionEntity,
  ApplicationCommandOptionType,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { COMMAND_LIMITS } from "../utils/index.js";

/**
 * Zod validator for command option choices.
 * Choices are predefined values that users can select.
 */
export const CommandOptionChoiceSchema = z.object({
  /**
   * Choice name displayed to users, 1-100 characters.
   */
  name: z.string().min(1).max(COMMAND_LIMITS.CHOICE_NAME),

  /**
   * Localization dictionary for the name field.
   */
  name_localizations: z
    .record(z.string(), z.string().min(1).max(COMMAND_LIMITS.CHOICE_NAME))
    .optional(),

  /**
   * Value of the choice, either string or number.
   * String values limited to 100 characters.
   */
  value: z.union([
    z.string().max(COMMAND_LIMITS.CHOICE_STRING_VALUE),
    z.number(),
  ]),
});

/**
 * Base schema for all command options with common properties.
 */
export const BaseCommandOptionSchema = z.object({
  /**
   * Type of option.
   */
  type: z.enum(ApplicationCommandOptionType),

  /**
   * Name of the option, 1-32 characters, lowercase.
   */
  name: z
    .string()
    .min(1)
    .max(COMMAND_LIMITS.OPTION_NAME)
    .refine((name) => APPLICATION_COMMAND_NAME_REGEX.test(name.toLowerCase()), {
      message:
        "Option name must match the regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
    }),

  /**
   * Localization dictionary for the name field.
   */
  name_localizations: z
    .record(z.string(), z.string().min(1).max(COMMAND_LIMITS.OPTION_NAME))
    .optional()
    .nullable(),

  /**
   * Description of the option, 1-100 characters.
   */
  description: z.string().min(1).max(COMMAND_LIMITS.OPTION_DESCRIPTION),

  /**
   * Localization dictionary for the description field.
   */
  description_localizations: z
    .record(
      z.string(),
      z.string().min(1).max(COMMAND_LIMITS.OPTION_DESCRIPTION),
    )
    .optional()
    .nullable(),

  /**
   * Whether this option is required, default false.
   */
  required: z.boolean().optional(),
});

/**
 * Schema for string options.
 */
export const StringOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be String (3).
   */
  type: z.literal(ApplicationCommandOptionType.String),

  /**
   * Choices for string options.
   */
  choices: z
    .array(CommandOptionChoiceSchema)
    .max(COMMAND_LIMITS.OPTION_CHOICES)
    .optional(),

  /**
   * Minimum allowed length (0-6000).
   */
  min_length: z.number().int().min(0).max(6000).optional(),

  /**
   * Maximum allowed length (1-6000).
   */
  max_length: z.number().int().min(1).max(6000).optional(),

  /**
   * Whether autocomplete interactions are enabled.
   */
  autocomplete: z.boolean().optional(),
})
  .refine(
    (data) => {
      // Autocomplete and choices cannot both be present
      return !(data.autocomplete && data.choices && data.choices.length > 0);
    },
    {
      message: "Autocomplete and choices cannot both be specified",
      path: ["_all"],
    },
  )
  .refine(
    (data) => {
      // Min length cannot be greater than max length
      if (data.min_length !== undefined && data.max_length !== undefined) {
        return data.min_length <= data.max_length;
      }
      return true;
    },
    {
      message: "Minimum length cannot be greater than maximum length",
      path: ["min_length", "max_length"],
    },
  );

/**
 * Schema for integer options.
 */
export const IntegerOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Integer (4).
   */
  type: z.literal(ApplicationCommandOptionType.Integer),

  /**
   * Choices for integer options.
   */
  choices: z
    .array(CommandOptionChoiceSchema)
    .max(COMMAND_LIMITS.OPTION_CHOICES)
    .optional(),

  /**
   * Minimum value for the integer.
   */
  min_value: z.number().int().optional(),

  /**
   * Maximum value for the integer.
   */
  max_value: z.number().int().optional(),

  /**
   * Whether autocomplete interactions are enabled.
   */
  autocomplete: z.boolean().optional(),
})
  .refine(
    (data) => {
      // Autocomplete and choices cannot both be present
      return !(data.autocomplete && data.choices && data.choices.length > 0);
    },
    {
      message: "Autocomplete and choices cannot both be specified",
      path: ["_all"],
    },
  )
  .refine(
    (data) => {
      // Min value cannot be greater than max value
      if (data.min_value !== undefined && data.max_value !== undefined) {
        return data.min_value <= data.max_value;
      }
      return true;
    },
    {
      message: "Minimum value cannot be greater than maximum value",
      path: ["min_value", "max_value"],
    },
  );

/**
 * Schema for number options (floating point).
 */
export const NumberOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Number (10).
   */
  type: z.literal(ApplicationCommandOptionType.Number),

  /**
   * Choices for number options.
   */
  choices: z
    .array(CommandOptionChoiceSchema)
    .max(COMMAND_LIMITS.OPTION_CHOICES)
    .optional(),

  /**
   * Minimum value for the number.
   */
  min_value: z.number().optional(),

  /**
   * Maximum value for the number.
   */
  max_value: z.number().optional(),

  /**
   * Whether autocomplete interactions are enabled.
   */
  autocomplete: z.boolean().optional(),
})
  .refine(
    (data) => {
      // Autocomplete and choices cannot both be present
      return !(data.autocomplete && data.choices && data.choices.length > 0);
    },
    {
      message: "Autocomplete and choices cannot both be specified",
      path: ["_all"],
    },
  )
  .refine(
    (data) => {
      // Min value cannot be greater than max value
      if (data.min_value !== undefined && data.max_value !== undefined) {
        return data.min_value <= data.max_value;
      }
      return true;
    },
    {
      message: "Minimum value cannot be greater than maximum value",
      path: ["min_value", "max_value"],
    },
  );

/**
 * Schema for boolean options.
 */
export const BooleanOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Boolean (5).
   */
  type: z.literal(ApplicationCommandOptionType.Boolean),
});

/**
 * Schema for user options.
 */
export const UserOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be User (6).
   */
  type: z.literal(ApplicationCommandOptionType.User),
});

/**
 * Schema for channel options.
 */
export const ChannelOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Channel (7).
   */
  type: z.literal(ApplicationCommandOptionType.Channel),

  /**
   * Channel types to restrict selection to.
   */
  channel_types: z.array(z.number().int().nonnegative()).optional(),
});

/**
 * Schema for role options.
 */
export const RoleOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Role (8).
   */
  type: z.literal(ApplicationCommandOptionType.Role),
});

/**
 * Schema for mentionable options (users and roles).
 */
export const MentionableOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Mentionable (9).
   */
  type: z.literal(ApplicationCommandOptionType.Mentionable),
});

/**
 * Schema for attachment options.
 */
export const AttachmentOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be Attachment (11).
   */
  type: z.literal(ApplicationCommandOptionType.Attachment),
});

/**
 * Schema for subcommand options.
 */
export const SubCommandOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be SubCommand (1).
   */
  type: z.literal(ApplicationCommandOptionType.SubCommand),

  /**
   * Parameters for this subcommand.
   */
  options: z.lazy(() =>
    z.array(SimpleCommandOptionSchema).max(COMMAND_LIMITS.OPTIONS).optional(),
  ),
}).omit({ required: true });

/**
 * Schema for subcommand group options.
 */
export const SubCommandGroupOptionSchema = BaseCommandOptionSchema.extend({
  /**
   * Type must be SubCommandGroup (2).
   */
  type: z.literal(ApplicationCommandOptionType.SubCommandGroup),

  /**
   * Subcommands in this group.
   */
  options: z.lazy(() =>
    z.array(SubCommandOptionSchema).min(1).max(COMMAND_LIMITS.OPTIONS),
  ),
}).omit({ required: true });

/**
 * Union of simple option schemas (options that directly take input).
 */
export const SimpleCommandOptionSchema = z.discriminatedUnion("type", [
  StringOptionSchema,
  IntegerOptionSchema,
  NumberOptionSchema,
  BooleanOptionSchema,
  UserOptionSchema,
  ChannelOptionSchema,
  RoleOptionSchema,
  MentionableOptionSchema,
  AttachmentOptionSchema,
]);

/**
 * Comprehensive schema for all command option types.
 */
export const ApplicationCommandOptionSchema = z.discriminatedUnion("type", [
  StringOptionSchema,
  IntegerOptionSchema,
  NumberOptionSchema,
  BooleanOptionSchema,
  UserOptionSchema,
  ChannelOptionSchema,
  RoleOptionSchema,
  MentionableOptionSchema,
  AttachmentOptionSchema,
  SubCommandOptionSchema,
  SubCommandGroupOptionSchema,
]) satisfies z.ZodType<
  AnyApplicationCommandOptionEntity,
  AnyApplicationCommandOptionEntity
>;
