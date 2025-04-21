/**
 * Maximum character limits for embed components as defined by Discord's API.
 * These limits help ensure embeds will be displayed correctly across all platforms.
 */
export const EMBED_LIMITS = {
  /** Maximum total characters allowed across all components of an embed */
  TOTAL_LENGTH: 6000,

  /** Maximum length of embed title */
  TITLE: 256,

  /** Maximum length of embed description */
  DESCRIPTION: 4096,

  /** Maximum number of fields allowed in an embed */
  FIELDS: 25,

  /** Maximum length of a field name */
  FIELD_NAME: 256,

  /** Maximum length of a field value */
  FIELD_VALUE: 1024,

  /** Maximum length of footer text */
  FOOTER_TEXT: 2048,

  /** Maximum length of author name */
  AUTHOR_NAME: 256,
} as const;

/**
 * Maximum character limits for component elements as defined by Discord's API.
 * These limits help ensure components will be displayed correctly across all platforms.
 */
export const COMPONENT_LIMITS = {
  /** Maximum length for custom IDs */
  CUSTOM_ID: 100,

  /** Maximum length for button labels */
  BUTTON_LABEL: 80,

  /** Maximum length for select option labels */
  SELECT_OPTION_LABEL: 100,

  /** Maximum length for select option values */
  SELECT_OPTION_VALUE: 100,

  /** Maximum length for select option descriptions */
  SELECT_OPTION_DESCRIPTION: 100,

  /** Maximum length for select menu placeholders */
  SELECT_PLACEHOLDER: 150,

  /** Maximum number of options in a select menu */
  SELECT_OPTIONS: 25,

  /** Maximum number of components in an action row */
  ACTION_ROW_COMPONENTS: 5,

  /** Maximum number of action rows per message */
  ACTION_ROWS: 5,

  /** Maximum length for text input labels */
  TEXT_INPUT_LABEL: 45,

  /** Maximum length for text input values and placeholders */
  TEXT_INPUT_VALUE: 4000,

  /** Maximum length for text input placeholders */
  TEXT_INPUT_PLACEHOLDER: 100,
} as const;

/**
 * Maximum character limits for application command components.
 * These limits help ensure commands will be displayed correctly across all platforms.
 */
export const COMMAND_LIMITS = {
  /** Maximum total characters allowed across name, description, and values */
  TOTAL_LENGTH: 8000,

  /** Maximum length of a command name */
  NAME: 32,

  /** Maximum length of a command description */
  DESCRIPTION: 100,

  /** Maximum number of options allowed in a command */
  OPTIONS: 25,

  /** Maximum length of an option name */
  OPTION_NAME: 32,

  /** Maximum length of an option description */
  OPTION_DESCRIPTION: 100,

  /** Maximum number of choices allowed in an option */
  OPTION_CHOICES: 25,

  /** Maximum length of a choice name */
  CHOICE_NAME: 100,

  /** Maximum length of a choice string value */
  CHOICE_STRING_VALUE: 100,

  /** Maximum number of permissions in a command permissions update */
  PERMISSIONS: 100,
} as const;

/**
 * Maximum number of permissions allowed per command.
 * Discord limits command permissions to a maximum of 100 overwrites.
 */
export const MAX_PERMISSIONS = 100;
