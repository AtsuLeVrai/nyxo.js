import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { ChannelType } from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles}
 */
export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
 */
export const TextInputEntity = z.object({
  type: z.literal(ComponentType.TextInput).default(ComponentType.TextInput),
  custom_id: z.string().max(100),
  style: z.nativeEnum(TextInputStyle),
  label: z.string().max(45),
  min_length: z.number().int().min(0).max(4000).optional(),
  max_length: z.number().int().min(1).max(4000).optional(),
  required: z.boolean().default(true),
  value: z.string().max(4000).optional(),
  placeholder: z.string().max(100).optional(),
});

export type TextInputEntity = z.infer<typeof TextInputEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export const SelectMenuDefaultValueEntity = z.object({
  id: Snowflake,
  type: z.union([z.literal("user"), z.literal("role"), z.literal("channel")]),
});

export type SelectMenuDefaultValueEntity = z.infer<
  typeof SelectMenuDefaultValueEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export const SelectMenuOptionEntity = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
  emoji: EmojiEntity.pick({
    id: true,
    name: true,
    animated: true,
  }).optional(),
  default: z.boolean().optional(),
});

export type SelectMenuOptionEntity = z.infer<typeof SelectMenuOptionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export const SelectMenuBaseEntity = z.object({
  custom_id: z.string().max(100),
  placeholder: z.string().max(150).optional(),
  min_values: z.number().int().min(0).max(25).default(1),
  max_values: z.number().int().min(1).max(25).default(1),
  disabled: z.boolean().optional(),
  default_values: z.array(SelectMenuDefaultValueEntity).optional(),
});

export type SelectMenuBaseEntity = z.infer<typeof SelectMenuBaseEntity>;

export const StringSelectMenuEntity = SelectMenuBaseEntity.extend({
  type: z
    .literal(ComponentType.StringSelect)
    .default(ComponentType.StringSelect),
  options: z.array(SelectMenuOptionEntity).min(1).max(25),
});

export type StringSelectMenuEntity = z.infer<typeof StringSelectMenuEntity>;

export const ChannelSelectMenuEntity = SelectMenuBaseEntity.extend({
  type: z
    .literal(ComponentType.ChannelSelect)
    .default(ComponentType.ChannelSelect),
  channel_types: z.nativeEnum(ChannelType).optional(),
});

export type ChannelSelectMenuEntity = z.infer<typeof ChannelSelectMenuEntity>;

export const UserSelectMenuEntity = SelectMenuBaseEntity.extend({
  type: z.literal(ComponentType.UserSelect).default(ComponentType.UserSelect),
});

export type UserSelectMenuEntity = z.infer<typeof UserSelectMenuEntity>;

export const RoleSelectMenuEntity = SelectMenuBaseEntity.extend({
  type: z.literal(ComponentType.RoleSelect).default(ComponentType.RoleSelect),
});

export type RoleSelectMenuEntity = z.infer<typeof RoleSelectMenuEntity>;

export const MentionableSelectMenuEntity = SelectMenuBaseEntity.extend({
  type: z
    .literal(ComponentType.MentionableSelect)
    .default(ComponentType.MentionableSelect),
});

export type MentionableSelectMenuEntity = z.infer<
  typeof MentionableSelectMenuEntity
>;

export const SelectMenuEntity = z.discriminatedUnion("type", [
  StringSelectMenuEntity,
  ChannelSelectMenuEntity,
  UserSelectMenuEntity,
  RoleSelectMenuEntity,
  MentionableSelectMenuEntity,
]);

export type SelectMenuEntity = z.infer<typeof SelectMenuEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export const ButtonEntity = z
  .object({
    type: z.literal(ComponentType.Button).default(ComponentType.Button),
    style: z.nativeEnum(ButtonStyle).default(ButtonStyle.Primary),
    label: z.string().max(80).optional(),
    emoji: EmojiEntity.pick({
      name: true,
      id: true,
      animated: true,
    }).optional(),
    custom_id: z.string().max(100).optional(),
    sku_id: z.string().optional(),
    url: z.string().url().optional(),
    disabled: z.boolean().default(false),
  })

  .superRefine((button, ctx) => {
    if (button.style === ButtonStyle.Link && !button.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons must have a url",
      });
    } else if (button.style === ButtonStyle.Link && button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons cannot have a custom_id",
      });
    } else if (button.style === ButtonStyle.Premium && !button.sku_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Premium buttons must have a sku_id",
      });
    } else if (button.style !== ButtonStyle.Link && !button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-link buttons must have a custom_id",
      });
    }
  });

export type ButtonEntity = z.infer<typeof ButtonEntity>;

export const ComponentEntity = z.discriminatedUnion("type", [
  ButtonEntity.sourceType(),
  TextInputEntity,
  ...SelectMenuEntity.options,
]);

export type ComponentEntity = z.infer<typeof ComponentEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export const ActionRowEntity = z
  .object({
    type: z.literal(ComponentType.ActionRow).default(ComponentType.ActionRow),
    components: z.array(ComponentEntity).max(5),
  })

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

export type ActionRowEntity = z.infer<typeof ActionRowEntity>;
