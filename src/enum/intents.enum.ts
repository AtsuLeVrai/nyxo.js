/**
 * @description Discord Gateway intent bits for controlling which events your bot receives.
 * @see {@link https://discord.com/developers/docs/events/gateway#gateway-intents}
 */
export enum GatewayIntentBits {
  /** Guild create/update/delete, role create/update/delete, channel create/update/delete */
  Guilds = 1 << 0,
  /** Guild member add/update/remove */
  GuildMembers = 1 << 1,
  /** Guild ban add/remove */
  GuildModeration = 1 << 2,
  /** Guild emoji, sticker, and soundboard sound updates */
  GuildExpressions = 1 << 3,
  /** Guild integration updates */
  GuildIntegrations = 1 << 4,
  /** Guild webhook updates */
  GuildWebhooks = 1 << 5,
  /** Guild invite create/delete */
  GuildInvites = 1 << 6,
  /** Guild voice state updates */
  GuildVoiceStates = 1 << 7,
  /** Guild member presence updates */
  GuildPresences = 1 << 8,
  /** Guild message create/update/delete */
  GuildMessages = 1 << 9,
  /** Guild message reaction add/remove */
  GuildMessageReactions = 1 << 10,
  /** Guild typing start events */
  GuildMessageTyping = 1 << 11,
  /** Direct message create/update/delete */
  DirectMessages = 1 << 12,
  /** Direct message reaction add/remove */
  DirectMessageReactions = 1 << 13,
  /** Direct message typing start events */
  DirectMessageTyping = 1 << 14,
  /** Message content in MESSAGE_CREATE and MESSAGE_UPDATE events (privileged) */
  MessageContent = 1 << 15,
  /** Guild scheduled event create/update/delete/user add/remove */
  GuildScheduledEvents = 1 << 16,
  /** Auto moderation rule create/update/delete */
  AutoModerationConfiguration = 1 << 20,
  /** Auto moderation action execution */
  AutoModerationExecution = 1 << 21,
  /** Guild message poll vote add/remove */
  GuildMessagePolls = 1 << 24,
  /** Direct message poll vote add/remove */
  DirectMessagePolls = 1 << 25,
}
