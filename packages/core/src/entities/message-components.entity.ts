import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { ChannelType } from "./channel.entity.js";
import { EmojiSchema } from "./emoji.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
export const ComponentType = {
  actionRow: 1,
  button: 2,
  stringSelect: 3,
  textInput: 4,
  userSelect: 5,
  roleSelect: 6,
  mentionableSelect: 7,
  channelSelect: 8,
} as const;

export type ComponentType = (typeof ComponentType)[keyof typeof ComponentType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export const TextInputStyle = {
  short: 1,
  paragraph: 2,
} as const;

export type TextInputStyle =
  (typeof TextInputStyle)[keyof typeof TextInputStyle];

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
 */
export const TextInputSchema = z
  .object({
    type: z.literal(ComponentType.textInput),
    custom_id: z.string().max(100),
    style: z.nativeEnum(TextInputStyle),
    label: z.string().max(45),
    min_length: z.number().int().min(0).max(4000).optional(),
    max_length: z.number().int().min(1).max(4000).optional(),
    required: z.boolean().optional().default(true),
    value: z.string().max(4000).optional(),
    placeholder: z.string().max(100).optional(),
  })
  .strict();

export type TextInputEntity = z.infer<typeof TextInputSchema>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export const SelectMenuDefaultValueSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.union([z.literal("user"), z.literal("role"), z.literal("channel")]),
  })
  .strict();

export type SelectMenuDefaultValueEntity = z.infer<
  typeof SelectMenuDefaultValueSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export const SelectMenuOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional(),
    emoji: EmojiSchema.pick({
      id: true,
      name: true,
      animated: true,
    }).optional(),
    default: z.boolean().optional(),
  })
  .strict();

export type SelectMenuOptionEntity = z.infer<typeof SelectMenuOptionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export const SelectMenuBaseSchema = z
  .object({
    custom_id: z.string().max(100),
    placeholder: z.string().max(150).optional(),
    min_values: z.number().int().min(0).max(25).optional().default(1),
    max_values: z.number().int().min(1).max(25).optional().default(1),
    disabled: z.boolean().optional(),
    default_values: z.array(SelectMenuDefaultValueSchema).optional(),
  })
  .strict();

export type SelectMenuBaseEntity = z.infer<typeof SelectMenuBaseSchema>;

export const StringSelectMenuSchema = SelectMenuBaseSchema.extend({
  type: z.literal(ComponentType.stringSelect),
  options: z.array(SelectMenuOptionSchema).min(1).max(25),
}).strict();

export type StringSelectMenuEntity = z.infer<typeof StringSelectMenuSchema>;

export const ChannelSelectMenuSchema = SelectMenuBaseSchema.extend({
  type: z.literal(ComponentType.channelSelect),
  channel_types: z.nativeEnum(ChannelType).optional(),
}).strict();

export type ChannelSelectMenuEntity = z.infer<typeof ChannelSelectMenuSchema>;

export const UserSelectMenuSchema = SelectMenuBaseSchema.extend({
  type: z.literal(ComponentType.userSelect),
}).strict();

export type UserSelectMenuEntity = z.infer<typeof UserSelectMenuSchema>;

export const RoleSelectMenuSchema = SelectMenuBaseSchema.extend({
  type: z.literal(ComponentType.roleSelect),
}).strict();

export type RoleSelectMenuEntity = z.infer<typeof RoleSelectMenuSchema>;

export const MentionableSelectMenuSchema = SelectMenuBaseSchema.extend({
  type: z.literal(ComponentType.mentionableSelect),
}).strict();

export type MentionableSelectMenuEntity = z.infer<
  typeof MentionableSelectMenuSchema
>;

export const SelectMenuSchema = z.discriminatedUnion("type", [
  StringSelectMenuSchema,
  ChannelSelectMenuSchema,
  UserSelectMenuSchema,
  RoleSelectMenuSchema,
  MentionableSelectMenuSchema,
]);

export type SelectMenuEntity = z.infer<typeof SelectMenuSchema>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles}
 */
export const ButtonStyle = {
  primary: 1,
  secondary: 2,
  success: 3,
  danger: 4,
  link: 5,
  premium: 6,
} as const;

export type ButtonStyle = (typeof ButtonStyle)[keyof typeof ButtonStyle];

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export const ButtonSchema = z
  .object({
    type: z.literal(ComponentType.button),
    style: z.nativeEnum(ButtonStyle),
    label: z.string().max(80).optional(),
    emoji: EmojiSchema.pick({
      name: true,
      id: true,
      animated: true,
    }).optional(),
    custom_id: z.string().max(100).optional(),
    sku_id: z.string().optional(),
    url: z.string().url().optional(),
    disabled: z.boolean().default(false).optional(),
  })
  .strict()
  .superRefine((button, ctx) => {
    if (button.style === ButtonStyle.link && !button.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons must have a url",
      });
    } else if (button.style === ButtonStyle.link && button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons cannot have a custom_id",
      });
    } else if (button.style === ButtonStyle.premium && !button.sku_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Premium buttons must have a sku_id",
      });
    } else if (button.style !== ButtonStyle.link && !button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-link buttons must have a custom_id",
      });
    }
  });

export type ButtonEntity = z.infer<typeof ButtonSchema>;

export const ComponentSchema = z.discriminatedUnion("type", [
  ButtonSchema.sourceType(),
  TextInputSchema,
  ...SelectMenuSchema.options,
]);

export type ComponentEntity = z.infer<typeof ComponentSchema>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export const ActionRowSchema = z
  .object({
    type: z.literal(ComponentType.actionRow),
    components: z.array(ComponentSchema).max(5),
  })
  .strict()
  .superRefine((row, ctx) => {
    const hasButton = row.components.some((c) => "style" in c);
    const hasSelectMenu = row.components.some(
      (c) => "options" in c || "channel_types" in c,
    );

    if (hasButton && hasSelectMenu) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows cannot contain both buttons and select menus",
      });
    }

    if (hasSelectMenu && row.components.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows can only contain one select menu",
      });
    }

    if (hasButton && row.components.length > 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows can only contain up to 5 buttons",
      });
    }
  });

export type ActionRowEntity = z.infer<typeof ActionRowSchema>;
