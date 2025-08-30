import type { ChannelType } from "../channel/index.js";
import type { EmojiEntity } from "../emoji/index.js";

/**
 * @description Discord message and modal component types across all systems.
 * @see {@link https://discord.com/developers/docs/components/reference#component-object-component-types}
 */
export enum ComponentType {
  /** Container for interactive components in a row layout */
  ActionRow = 1,
  /** Interactive button component */
  Button = 2,
  /** Select menu with predefined string options */
  StringSelect = 3,
  /** Text input field for modals */
  TextInput = 4,
  /** Select menu for Discord users */
  UserSelect = 5,
  /** Select menu for Discord roles */
  RoleSelect = 6,
  /** Select menu for mentionable entities (users and roles) */
  MentionableSelect = 7,
  /** Select menu for Discord channels */
  ChannelSelect = 8,
  /** Layout component combining text with accessory (Components v2 only) */
  Section = 9,
  /** Rich markdown text display component (Components v2 only) */
  TextDisplay = 10,
  /** Small image accessory component (Components v2 only) */
  Thumbnail = 11,
  /** Grid layout for multiple media items (Components v2 only) */
  MediaGallery = 12,
  /** File attachment display component (Components v2 only) */
  File = 13,
  /** Visual separator with padding (Components v2 only) */
  Separator = 14,
  /** Visual grouping container with optional accent color (Components v2 only) */
  Container = 17,
  /** Modal component wrapper with label and description (Modals only) */
  Label = 18,
}

/**
 * @description Text input field display styles for Discord modal components.
 * @see {@link https://discord.com/developers/docs/components/reference#text-input-text-input-styles}
 */
export enum TextInputStyle {
  /** Single-line text input */
  Short = 1,
  /** Multi-line paragraph text input */
  Paragraph = 2,
}

/**
 * @description Button visual styles and interaction behaviors for Discord components.
 * @see {@link https://discord.com/developers/docs/components/reference#button-button-styles}
 */
export enum ButtonStyle {
  /** Primary action button (blurple color) */
  Primary = 1,
  /** Secondary action button (gray color) */
  Secondary = 2,
  /** Success confirmation button (green color) */
  Success = 3,
  /** Dangerous action button (red color) */
  Danger = 4,
  /** External link button (gray color, no interaction) */
  Link = 5,
  /** Premium purchase button (blurple color, Discord handles) */
  Premium = 6,
}

/**
 * @description Media item structure for Discord component attachments and external URLs.
 * @see {@link https://discord.com/developers/docs/components/reference#unfurled-media-item}
 */
export interface UnfurledMediaItemEntity {
  /** Direct URL or attachment reference (attachment://filename) */
  url: string;
  /** Discord CDN proxy URL (automatically populated by API) */
  proxy_url?: string;
  /** Media height in pixels (automatically populated by API) */
  height?: number | null;
  /** Media width in pixels (automatically populated by API) */
  width?: number | null;
  /** MIME content type (automatically populated by API) */
  content_type?: string;
  /** Attachment snowflake ID for uploaded files (automatically populated by API) */
  attachment_id?: string;
}

/**
 * @description Default value configuration for Discord select menu components.
 * @see {@link https://discord.com/developers/docs/components/reference#user-select-select-default-value-structure}
 */
export interface SelectMenuDefaultValueEntity {
  /** Discord snowflake ID of the entity */
  id: string;
  /** Entity type for proper Discord API resolution */
  type: "user" | "role" | "channel";
}

/**
 * @description Individual option configuration for Discord string select components.
 * @see {@link https://discord.com/developers/docs/components/reference#string-select-select-option-structure}
 */
export interface SelectMenuOptionEntity {
  /** User-facing name displayed in select menu (max 100 characters) */
  label: string;
  /** Developer-defined value returned in interactions (max 100 characters) */
  value: string;
  /** Optional detailed description of option (max 100 characters) */
  description?: string;
  /** Optional emoji displayed with option */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Whether option appears as selected by default */
  default?: boolean;
}

/**
 * @description Interactive button component for Discord messages and section accessories.
 * @see {@link https://discord.com/developers/docs/components/reference#button}
 */
export interface ButtonEntity {
  type: ComponentType.Button;
  /** Unique identifier for component within message */
  id?: number;
  /** Button visual style and interaction behavior */
  style: ButtonStyle;
  /** Button text label (max 80 characters, not allowed for premium buttons) */
  label?: string;
  /** Optional emoji displayed with button text */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Developer-defined identifier for interaction responses (required for interactive buttons) */
  custom_id?: string;
  /** Discord SKU ID for premium purchase buttons */
  sku_id?: string;
  /** External URL for link buttons (max 512 characters) */
  url?: string;
  /** Whether button is disabled and non-interactive (defaults to false) */
  disabled?: boolean;
}

/**
 * @description Base configuration for all Discord select menu component types.
 * @see {@link https://discord.com/developers/docs/components/reference#string-select}
 */
export interface SelectMenuEntity {
  /** Select menu component type */
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  /** Unique identifier for component within message */
  id?: number;
  /** Developer-defined identifier for interaction responses (max 100 characters) */
  custom_id: string;
  /** Predefined options for string select menus (max 25) */
  options?: SelectMenuOptionEntity[];
  /** Channel type filters for channel select menus */
  channel_types?: ChannelType[];
  /** Placeholder text when nothing is selected (max 150 characters) */
  placeholder?: string;
  /** Minimum number of required selections (0-25, defaults to 1) */
  min_values?: number;
  /** Maximum number of allowed selections (1-25, defaults to 1) */
  max_values?: number;
  /** Whether select menu is disabled (defaults to false) */
  disabled?: boolean;
  /** Whether select menu is required in modals (defaults to true, ignored in messages) */
  required?: boolean;
  /** Pre-selected default values for auto-populated menus */
  default_values?: SelectMenuDefaultValueEntity[];
}

/**
 * @description String select menu with developer-defined options for Discord messages and modals.
 * @see {@link https://discord.com/developers/docs/components/reference#string-select}
 */
export interface StringSelectMenuEntity
  extends Omit<SelectMenuEntity, "channel_types" | "default_values"> {
  type: ComponentType.StringSelect;
  /** Array of selectable options (required for string select, max 25) */
  options: SelectMenuOptionEntity[];
}

/**
 * @description User select menu with auto-populated Discord users from the server.
 * @see {@link https://discord.com/developers/docs/components/reference#user-select}
 */
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

/**
 * @description Role select menu with auto-populated Discord roles from the server.
 * @see {@link https://discord.com/developers/docs/components/reference#role-select}
 */
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

/**
 * @description Mentionable select menu combining users and roles from the server.
 * @see {@link https://discord.com/developers/docs/components/reference#mentionable-select}
 */
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

/**
 * @description Channel select menu with auto-populated Discord channels, optionally filtered by type.
 * @see {@link https://discord.com/developers/docs/components/reference#channel-select}
 */
export interface ChannelSelectMenuEntity extends Omit<SelectMenuEntity, "options" | "required"> {
  type: ComponentType.ChannelSelect;
}

/**
 * @description Union type for all Discord select menu component variations.
 */
export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity
  | ChannelSelectMenuEntity;

/**
 * @description Text input component for collecting user text responses in Discord modals.
 * @see {@link https://discord.com/developers/docs/components/reference#text-input}
 */
export interface TextInputEntity {
  type: ComponentType.TextInput;
  /** Unique identifier for component within modal */
  id?: number;
  /** Developer-defined identifier for interaction responses (max 100 characters) */
  custom_id: string;
  /** Text input display style (Short or Paragraph) */
  style: TextInputStyle;
  /** Minimum input length constraint (0-4000 characters) */
  min_length?: number;
  /** Maximum input length constraint (1-4000 characters) */
  max_length?: number;
  /** Whether component is required to be filled (defaults to true) */
  required?: boolean;
  /** Pre-filled text value (max 4000 characters) */
  value?: string;
  /** Placeholder text when input is empty (max 100 characters) */
  placeholder?: string;
}

/**
 * @description Union type for all interactive Discord components.
 */
export type InteractiveComponentEntity = ButtonEntity | AnySelectMenuEntity;

/**
 * @description Legacy action row container for interactive components (pre-Components v2).
 * Used without IS_COMPONENTS_V2 flag alongside content/embeds.
 * @see {@link https://discord.com/developers/docs/components/reference#legacy-message-component-behavior}
 */
export interface LegacyActionRowEntity {
  type: ComponentType.ActionRow;
  /** Legacy components have id of 0 */
  id?: 0;
  /** Interactive components arranged horizontally (max 5 buttons or 1 select) */
  components: InteractiveComponentEntity[];
}

/**
 * @description Rich markdown text component for Discord messages with Components v2.
 * @see {@link https://discord.com/developers/docs/components/reference#text-display}
 */
export interface TextDisplayEntity {
  type: ComponentType.TextDisplay;
  /** Unique identifier for component within message */
  id?: number;
  /** Markdown-formatted text content with full Discord formatting support */
  content: string;
}

/**
 * @description Small image accessory component for Discord section layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#thumbnail}
 */
export interface ThumbnailEntity {
  type: ComponentType.Thumbnail;
  /** Unique identifier for component within message */
  id?: number;
  /** Image media item (supports images, GIF, WEBP) */
  media: UnfurledMediaItemEntity;
  /** Alt text description for accessibility (max 1024 characters) */
  description?: string;
  /** Whether image should be blurred as spoiler (defaults to false) */
  spoiler?: boolean;
}

/**
 * @description Layout component associating text content with an accessory for Discord messages.
 * @see {@link https://discord.com/developers/docs/components/reference#section}
 */
export interface SectionEntity {
  type: ComponentType.Section;
  /** Unique identifier for component within message */
  id?: number;
  /** Text content components contextually associated with accessory (1-3 components) */
  components: TextDisplayEntity[];
  /** Accessory component providing visual context to text content */
  accessory: ThumbnailEntity | ButtonEntity;
}

/**
 * @description Individual media item within a Discord media gallery component.
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery-media-gallery-item-structure}
 */
export interface MediaGalleryItemEntity {
  /** Image or video media item */
  media: UnfurledMediaItemEntity;
  /** Alt text description for accessibility (max 1024 characters) */
  description?: string;
  /** Whether media should be blurred as spoiler (defaults to false) */
  spoiler?: boolean;
}

/**
 * @description Grid layout component for organizing multiple media items in Discord messages.
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery}
 */
export interface MediaGalleryEntity {
  type: ComponentType.MediaGallery;
  /** Unique identifier for component within message */
  id?: number;
  /** Array of media items displayed in gallery grid (1-10 items) */
  items: MediaGalleryItemEntity[];
}

/**
 * @description File attachment display component for Discord messages with Components v2.
 * @see {@link https://discord.com/developers/docs/components/reference#file}
 */
export interface FileEntity {
  type: ComponentType.File;
  /** Unique identifier for component within message */
  id?: number;
  /** File attachment (must use attachment:// protocol) */
  file: UnfurledMediaItemEntity;
  /** Whether file should be blurred as spoiler (defaults to false) */
  spoiler?: boolean;
  /** File name (automatically populated by Discord API) */
  name?: string;
  /** File size in bytes (automatically populated by Discord API) */
  size?: number;
}

/**
 * @description Visual separator component providing spacing and dividers in Discord messages.
 * @see {@link https://discord.com/developers/docs/components/reference#separator}
 */
export interface SeparatorEntity {
  type: ComponentType.Separator;
  /** Unique identifier for component within message */
  id?: number;
  /** Whether to display visual divider line (defaults to true) */
  divider?: boolean;
  /** Padding size: 1 for small, 2 for large (defaults to 1) */
  spacing?: 1 | 2;
}

/**
 * @description Components v2 action row container for interactive components.
 * Used with IS_COMPONENTS_V2 flag in modern message layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#action-row}
 */
export interface ComponentsV2ActionRowEntity {
  type: ComponentType.ActionRow;
  /** Unique identifier for component within message */
  id?: number;
  /** Interactive components arranged horizontally (max 5 buttons or 1 select) */
  components: InteractiveComponentEntity[];
}

/**
 * @description Visual grouping container with optional accent color for Discord messages.
 * @see {@link https://discord.com/developers/docs/components/reference#container}
 */
export interface ContainerEntity {
  type: ComponentType.Container;
  /** Unique identifier for component within message */
  id?: number;
  /** Child components enclosed within container */
  components: ComponentsV2MessageComponentEntity[];
  /** RGB accent color from 0x000000 to 0xFFFFFF */
  accent_color?: number | null;
  /** Whether container should be blurred as spoiler (defaults to false) */
  spoiler?: boolean;
}

/**
 * @description Union type for Components v2 content components.
 */
export type ComponentsV2ContentEntity =
  | TextDisplayEntity
  | SectionEntity
  | MediaGalleryEntity
  | FileEntity
  | ThumbnailEntity;

/**
 * @description Union type for Components v2 layout components.
 */
export type ComponentsV2LayoutEntity =
  | ComponentsV2ActionRowEntity
  | SeparatorEntity
  | ContainerEntity;

/**
 * @description Union type for all Components v2 message components.
 * Used with IS_COMPONENTS_V2 flag (replaces content/embeds).
 */
export type ComponentsV2MessageComponentEntity =
  | ComponentsV2ContentEntity
  | ComponentsV2LayoutEntity;

/**
 * @description Label component wrapping modal components with title and description.
 * @see {@link https://discord.com/developers/docs/components/reference#label}
 */
export interface LabelEntity {
  type: ComponentType.Label;
  /** Unique identifier for component within modal */
  id?: number;
  /** Label text displayed above component (max 45 characters) */
  label: string;
  /** Optional description providing additional context (max 100 characters) */
  description?: string;
  /** Wrapped input component (Text Input or String Select) */
  component: TextInputEntity | StringSelectMenuEntity;
}

/**
 * @description Union type for all Discord component entities across all systems.
 */
export type AnyComponentEntity =
  | LegacyActionRowEntity
  | ComponentsV2MessageComponentEntity
  | LabelEntity;
