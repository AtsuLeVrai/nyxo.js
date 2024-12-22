import {
  type ApplicationCommandOptionChoiceEntity,
  type ApplicationCommandOptionEntity,
  ApplicationCommandOptionType,
  type ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  type AvailableLocale,
  ChannelType,
  InteractionContextType,
  Locale,
  SnowflakeManager,
} from "@nyxjs/core";
import { z } from "zod";

const ApplicationCommandPermissionsSchema: z.ZodType<ApplicationCommandPermissionEntity> =
  z
    .object({
      id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
      type: z.nativeEnum(ApplicationCommandPermissionType),
      permission: z.boolean(),
    })
    .strict();

export const EditApplicationCommandPermissionsSchema = z
  .object({
    permissions: z.array(ApplicationCommandPermissionsSchema).max(100),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export type EditApplicationCommandPermissionsEntity = z.infer<
  typeof EditApplicationCommandPermissionsSchema
>;

export function createAvailableLocaleSchema(
  validator: z.ZodType<string>,
): z.ZodType<AvailableLocale> {
  return z
    .record(z.nativeEnum(Locale), validator)
    .optional()
    .nullable()
    .refine((data) => {
      if (!data) {
        return true;
      }
      return Object.values(data).every(
        (value) => validator.safeParse(value).success,
      );
    }) as z.ZodType<AvailableLocale>;
}

const ApplicationCommandOptionChoiceSchema: z.ZodType<ApplicationCommandOptionChoiceEntity> =
  z.object({
    name: z.string().min(1).max(100),
    name_localizations: createAvailableLocaleSchema(z.string().min(1).max(100))
      .optional()
      .nullable(),
    value: z.union([z.string().max(100), z.number()]),
  });

const ApplicationCommandOptionSchema: z.ZodType<ApplicationCommandOptionEntity> =
  z
    .object({
      type: z.nativeEnum(ApplicationCommandOptionType),
      name: z
        .string()
        .min(1)
        .min(32)
        .regex(/[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/u),
      name_localizations: createAvailableLocaleSchema(
        z
          .string()
          .min(1)
          .min(32)
          .regex(/[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/u),
      )
        .optional()
        .nullable(),
      description: z.string().min(1).max(100),
      description_localizations: createAvailableLocaleSchema(
        z.string().min(1).max(100),
      )
        .optional()
        .nullable(),
      required: z.boolean().default(false).optional(),
      choices: z.array(ApplicationCommandOptionChoiceSchema).max(25).optional(),
      options: z
        .array(z.lazy(() => ApplicationCommandOptionSchema))
        .max(25)
        .optional(),
      channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
      min_length: z.number().int().min(0).max(6000).optional(),
      max_length: z.number().int().min(1).max(6000).optional(),
      autocomplete: z.boolean().optional(),
    })
    .strict();

export const CreateGlobalApplicationCommandSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .min(32)
      .regex(/[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/u),
    name_localizations: z
      .record(
        z.nativeEnum(Locale),
        z
          .string()
          .min(1)
          .min(32)
          .regex(/[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/u),
      )
      .optional()
      .nullable(),
    description: z.string().min(1).max(100).optional(),
    description_localizations: z
      .record(z.nativeEnum(Locale), z.string().min(1).max(100))
      .optional()
      .nullable(),
    options: z.array(ApplicationCommandOptionSchema).max(25).optional(),
    default_member_permissions: z.string().optional().nullable(),
    /**
     * @deprecated User `contexts instead`
     */
    dm_permission: z.boolean().optional().nullable(),
    default_permission: z.boolean().default(true).optional(),
    integration_types: z
      .array(z.nativeEnum(ApplicationIntegrationType))
      .optional(),
    contexts: z.array(z.nativeEnum(InteractionContextType)).optional(),
    type: z
      .nativeEnum(ApplicationCommandType)
      .default(ApplicationCommandType.ChatInput)
      .optional(),
    nsfw: z.boolean().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export type CreateGlobalApplicationCommandEntity = z.infer<
  typeof CreateGlobalApplicationCommandSchema
>;

export const EditGlobalApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    type: true,
  })
    .strict()
    .partial();

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export type EditGlobalApplicationCommandEntity = z.infer<
  typeof EditGlobalApplicationCommandSchema
>;

export const CreateGuildApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    integration_types: true,
    contexts: true,
  }).strict();

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export type CreateGuildApplicationCommandEntity = z.infer<
  typeof CreateGuildApplicationCommandSchema
>;

export const EditGuildApplicationCommandSchema =
  CreateGuildApplicationCommandSchema.omit({
    type: true,
  })
    .strict()
    .partial();

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export type EditGuildApplicationCommandEntity = z.infer<
  typeof EditGuildApplicationCommandSchema
>;
