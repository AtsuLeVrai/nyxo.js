import type { Snowflake } from "../common/index.js";
import type { ChannelType } from "./channel.js";
import type { EmojiObject } from "./emoji.js";

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

export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6,
}

export enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

export enum SeparatorSpacing {
  Small = 1,
  Large = 2,
}

export type SelectDefaultValueType = "user" | "role" | "channel";

export interface ComponentObject {
  type: ComponentType;
  id?: number;
  custom_id?: string;
  disabled?: boolean;
  style?: ButtonStyle | TextInputStyle;
  label?: string;
  emoji?: Partial<EmojiObject>;
  url?: string;
  sku_id?: Snowflake;
  options?: SelectOptionObject[];
  placeholder?: string;
  default_values?: SelectDefaultValueObject[];
  min_values?: number;
  max_values?: number;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  channel_types?: ChannelType[];
  components?: ComponentObject[];
  accessory?: ComponentObject;
  content?: string;
  media?: UnfurledMediaItemObject;
  description?: string;
  spoiler?: boolean;
  items?: MediaGalleryItemObject[];
  file?: UnfurledMediaItemObject;
  name?: string;
  size?: number;
  divider?: boolean;
  spacing?: SeparatorSpacing;
  accent_color?: number;
}

export interface SelectOptionObject {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiObject, "id" | "name" | "animated">;
  default?: boolean;
}

export interface SelectDefaultValueObject {
  id: Snowflake;
  type: SelectDefaultValueType;
}

export interface UnfurledMediaItemObject {
  url: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  content_type?: string;
  attachment_id?: Snowflake;
}

export interface MediaGalleryItemObject {
  media: UnfurledMediaItemObject;
  description?: string;
  spoiler?: boolean;
}

export interface ActionRowComponentObject<
  T extends Exclude<
    AnyComponentObject,
    | ActionRowComponentObject
    | SectionComponentObject
    | ContainerComponentObject
    | TextDisplayComponentObject
    | ThumbnailComponentObject
    | MediaGalleryComponentObject
    | FileComponentObject
    | SeparatorComponentObject
  > =
    | ButtonComponentObject
    | StringSelectComponentObject
    | TextInputComponentObject
    | UserSelectComponentObject
    | RoleSelectComponentObject
    | MentionableSelectComponentObject
    | ChannelSelectComponentObject,
> extends Pick<ComponentObject, "type" | "id" | "components"> {
  type: ComponentType.ActionRow;
  components: T[];
}

export interface ButtonComponentObject
  extends Pick<
    ComponentObject,
    "type" | "id" | "style" | "label" | "emoji" | "custom_id" | "url" | "sku_id" | "disabled"
  > {
  type: ComponentType.Button;
  style: ButtonStyle;
  label?: string;
  emoji?: Partial<EmojiObject>;
  custom_id?: string;
  url?: string;
  sku_id?: Snowflake;
  disabled?: boolean;
}

export interface StringSelectComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "options"
    | "placeholder"
    | "min_values"
    | "max_values"
    | "disabled"
  > {
  type: ComponentType.StringSelect;
  custom_id: string;
  options: SelectOptionObject[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface TextInputComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "style"
    | "label"
    | "min_length"
    | "max_length"
    | "required"
    | "value"
    | "placeholder"
  > {
  type: ComponentType.TextInput;
  custom_id: string;
  style: TextInputStyle;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export interface UserSelectComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "default_values"
    | "min_values"
    | "max_values"
    | "disabled"
  > {
  type: ComponentType.UserSelect;
  custom_id: string;
  placeholder?: string;
  default_values?: SelectDefaultValueObject[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface RoleSelectComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "default_values"
    | "min_values"
    | "max_values"
    | "disabled"
  > {
  type: ComponentType.RoleSelect;
  custom_id: string;
  placeholder?: string;
  default_values?: SelectDefaultValueObject[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface MentionableSelectComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "placeholder"
    | "default_values"
    | "min_values"
    | "max_values"
    | "disabled"
  > {
  type: ComponentType.MentionableSelect;
  custom_id: string;
  placeholder?: string;
  default_values?: SelectDefaultValueObject[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface ChannelSelectComponentObject
  extends Pick<
    ComponentObject,
    | "type"
    | "id"
    | "custom_id"
    | "channel_types"
    | "placeholder"
    | "default_values"
    | "min_values"
    | "max_values"
    | "disabled"
  > {
  type: ComponentType.ChannelSelect;
  custom_id: string;
  channel_types?: ChannelType[];
  placeholder?: string;
  default_values?: SelectDefaultValueObject[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface SectionComponentObject
  extends Pick<ComponentObject, "type" | "id" | "components" | "accessory"> {
  type: ComponentType.Section;
  components: TextDisplayComponentObject[];
  accessory: ThumbnailComponentObject | ButtonComponentObject;
}

export interface TextDisplayComponentObject
  extends Pick<ComponentObject, "type" | "id" | "content"> {
  type: ComponentType.TextDisplay;
  content: string;
}

export interface ThumbnailComponentObject
  extends Pick<ComponentObject, "type" | "id" | "media" | "description" | "spoiler"> {
  type: ComponentType.Thumbnail;
  media: UnfurledMediaItemObject;
  description?: string;
  spoiler?: boolean;
}

export interface MediaGalleryComponentObject
  extends Pick<ComponentObject, "type" | "id" | "items"> {
  type: ComponentType.MediaGallery;
  items: MediaGalleryItemObject[];
}

export interface FileComponentObject
  extends Pick<ComponentObject, "type" | "id" | "file" | "spoiler" | "name" | "size"> {
  type: ComponentType.File;
  file: UnfurledMediaItemObject;
  spoiler?: boolean;
  name?: string;
  size?: number;
}

export interface SeparatorComponentObject
  extends Pick<ComponentObject, "type" | "id" | "divider" | "spacing"> {
  type: ComponentType.Separator;
  divider?: boolean;
  spacing?: SeparatorSpacing;
}

export interface ContainerComponentObject
  extends Pick<ComponentObject, "type" | "id" | "components" | "accent_color" | "spoiler"> {
  type: ComponentType.Container;
  components: (
    | ActionRowComponentObject
    | TextDisplayComponentObject
    | SectionComponentObject
    | MediaGalleryComponentObject
    | SeparatorComponentObject
    | FileComponentObject
  )[];
  accent_color?: number;
  spoiler?: boolean;
}

export type AnyComponentObject =
  | ActionRowComponentObject
  | ButtonComponentObject
  | StringSelectComponentObject
  | TextInputComponentObject
  | UserSelectComponentObject
  | RoleSelectComponentObject
  | MentionableSelectComponentObject
  | ChannelSelectComponentObject
  | SectionComponentObject
  | TextDisplayComponentObject
  | ThumbnailComponentObject
  | MediaGalleryComponentObject
  | FileComponentObject
  | SeparatorComponentObject
  | ContainerComponentObject;
