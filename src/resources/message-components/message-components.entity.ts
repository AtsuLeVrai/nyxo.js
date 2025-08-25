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

export interface TextInputEntity {
  type: ComponentType.TextInput;
  custom_id: string;
  style: TextInputStyle;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
  id?: number;
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

export interface SelectMenuEntity {
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  custom_id: string;
  options?: SelectMenuOptionEntity[];
  channel_types?: ChannelType[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  default_values?: SelectMenuDefaultValueEntity[];
  id?: number;
}

export interface StringSelectMenuEntity extends Omit<SelectMenuEntity, "channel_types"> {
  type: ComponentType.StringSelect;
  options: SelectMenuOptionEntity[];
}

export interface UserSelectMenuEntity extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  type: ComponentType.UserSelect;
}

export interface RoleSelectMenuEntity extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  type: ComponentType.RoleSelect;
}

export interface MentionableSelectMenuEntity
  extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  type: ComponentType.MentionableSelect;
}

export interface ChannelSelectMenuEntity extends Omit<SelectMenuEntity, "options"> {
  type: ComponentType.ChannelSelect;
  channel_types?: ChannelType[];
}

export interface UnfurledMediaItemEntity {
  url: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  content_type?: string;
}

export interface SectionEntity {
  type: ComponentType.Section;
  id?: number;
  components: TextDisplayEntity[];
  accessory: ThumbnailEntity | ButtonEntity;
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
}

export interface SeparatorEntity {
  type: ComponentType.Separator;
  id?: number;
  divider?: boolean;
  spacing?: 1 | 2;
}

export interface ContainerEntity {
  type: ComponentType.Container;
  id?: number;
  components: (
    | ActionRowEntity
    | TextDisplayEntity
    | SectionEntity
    | MediaGalleryEntity
    | SeparatorEntity
    | FileEntity
  )[];
  accent_color?: number | null;
  spoiler?: boolean;
}

export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity
  | ChannelSelectMenuEntity;

export interface ButtonEntity {
  type: ComponentType.Button;
  style: ButtonStyle;
  label?: string;
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  custom_id?: string;
  sku_id?: string;
  url?: string;
  disabled?: boolean;
  id?: number;
}

export type AnyComponentEntity =
  | ButtonEntity
  | TextInputEntity
  | AnySelectMenuEntity
  | SectionEntity
  | TextDisplayEntity
  | ThumbnailEntity
  | MediaGalleryEntity
  | FileEntity
  | SeparatorEntity
  | ContainerEntity;

export interface ActionRowEntity {
  type: ComponentType.ActionRow;
  components: AnyComponentEntity[];
  id?: number;
}
