import type { Integer, Snowflake } from "../formatting/index.js";
import type { ChannelType } from "./channels.js";
import type { EmojiEntity } from "./emojis.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
 */
export interface TextInputEntity {
  type: ComponentType.TextInput;
  custom_id: string;
  style: TextInputStyle;
  label: string;
  min_length?: Integer;
  max_length?: Integer;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export interface SelectMenuDefaultValue {
  id: Snowflake;
  type: "user" | "role" | "channel";
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  default?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface SelectMenuEntity {
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  custom_id: string;
  options?: SelectMenuOption[];
  channel_types?: ChannelType[];
  placeholder?: string;
  default_values?: SelectMenuDefaultValue[];
  min_values?: Integer;
  max_values?: Integer;
  disabled?: boolean;
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
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export interface ButtonEntity {
  type: ComponentType.Button;
  style: ButtonStyle;
  label?: string;
  emoji?: Pick<EmojiEntity, "name" | "id" | "animated">;
  custom_id?: string;
  sku_id?: Snowflake;
  url?: string;
  disabled?: boolean;
}

export type ComponentEntity = ButtonEntity | SelectMenuEntity | TextInputEntity;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export interface ActionRowEntity {
  type: ComponentType.ActionRow;
  components: ComponentEntity[];
}

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
