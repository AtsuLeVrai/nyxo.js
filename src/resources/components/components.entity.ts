import type { ChannelType } from "../channel/index.js";
import type { EmojiEntity } from "../emoji/index.js";

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
  Section = 9,
  TextDisplay = 10,
  Thumbnail = 11,
  MediaGallery = 12,
  File = 13,
  Separator = 14,
  Container = 17,
  Label = 18,
}

export enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6,
}

export interface UnfurledMediaItemEntity {
  url: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  content_type?: string;
  attachment_id?: string;
}

export interface SelectMenuDefaultValueEntity {
  id: string;
  type: "user" | "role" | "channel";
}

export interface SelectMenuOptionEntity {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  default?: boolean;
}

export interface ButtonEntity {
  type: ComponentType.Button;
  id?: number;
  style: ButtonStyle;
  label?: string;
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  custom_id?: string;
  sku_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface SelectMenuEntity {
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  id?: number;
  custom_id: string;
  options?: SelectMenuOptionEntity[];
  channel_types?: ChannelType[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  required?: boolean;
  default_values?: SelectMenuDefaultValueEntity[];
}

export interface StringSelectMenuEntity
  extends Omit<SelectMenuEntity, "channel_types" | "default_values"> {
  type: ComponentType.StringSelect;
  options: SelectMenuOptionEntity[];
}

export interface UserSelectMenuEntity
  extends Pick<
    SelectMenuEntity,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "min_values"
    | "max_values"
    | "disabled"
    | "default_values"
  > {
  type: ComponentType.UserSelect;
}

export interface RoleSelectMenuEntity
  extends Pick<
    SelectMenuEntity,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "min_values"
    | "max_values"
    | "disabled"
    | "default_values"
  > {
  type: ComponentType.RoleSelect;
}

export interface MentionableSelectMenuEntity
  extends Pick<
    SelectMenuEntity,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "min_values"
    | "max_values"
    | "disabled"
    | "default_values"
  > {
  type: ComponentType.MentionableSelect;
}

export interface ChannelSelectMenuEntity extends Omit<SelectMenuEntity, "options" | "required"> {
  type: ComponentType.ChannelSelect;
}

export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity
  | ChannelSelectMenuEntity;

export interface TextInputEntity {
  type: ComponentType.TextInput;
  id?: number;
  custom_id: string;
  style: TextInputStyle;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export type InteractiveComponentEntity = ButtonEntity | AnySelectMenuEntity;

export interface LegacyActionRowEntity {
  type: ComponentType.ActionRow;
  id?: 0;
  components: InteractiveComponentEntity[];
}

export interface TextDisplayEntity {
  type: ComponentType.TextDisplay;
  id?: number;
  content: string;
}

export interface ThumbnailEntity {
  type: ComponentType.Thumbnail;
  id?: number;
  media: UnfurledMediaItemEntity;
  description?: string;
  spoiler?: boolean;
}

export interface SectionEntity {
  type: ComponentType.Section;
  id?: number;
  components: TextDisplayEntity[];
  accessory: ThumbnailEntity | ButtonEntity;
}

export interface MediaGalleryItemEntity {
  media: UnfurledMediaItemEntity;
  description?: string;
  spoiler?: boolean;
}

export interface MediaGalleryEntity {
  type: ComponentType.MediaGallery;
  id?: number;
  items: MediaGalleryItemEntity[];
}

export interface FileEntity {
  type: ComponentType.File;
  id?: number;
  file: UnfurledMediaItemEntity;
  spoiler?: boolean;
  name?: string;
  size?: number;
}

export interface SeparatorEntity {
  type: ComponentType.Separator;
  id?: number;
  divider?: boolean;
  spacing?: 1 | 2;
}

export interface ComponentsV2ActionRowEntity {
  type: ComponentType.ActionRow;
  id?: number;
  components: InteractiveComponentEntity[];
}

export interface ContainerEntity {
  type: ComponentType.Container;
  id?: number;
  components: ComponentsV2MessageComponentEntity[];
  accent_color?: number | null;
  spoiler?: boolean;
}

export type ComponentsV2ContentEntity =
  | TextDisplayEntity
  | SectionEntity
  | MediaGalleryEntity
  | FileEntity
  | ThumbnailEntity;

export type ComponentsV2LayoutEntity =
  | ComponentsV2ActionRowEntity
  | SeparatorEntity
  | ContainerEntity;

export type ComponentsV2MessageComponentEntity =
  | ComponentsV2ContentEntity
  | ComponentsV2LayoutEntity;

export interface LabelEntity {
  type: ComponentType.Label;
  id?: number;
  label: string;
  description?: string;
  component: TextInputEntity | StringSelectMenuEntity;
}

export type AnyComponentEntity =
  | LegacyActionRowEntity
  | ComponentsV2MessageComponentEntity
  | LabelEntity;
