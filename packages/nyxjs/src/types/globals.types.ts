import type { GuildApplicationCommandPermissionEntity } from "@nyxjs/core";
import type { GatewayEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import type {
  AnyChannel,
  AnyInteraction,
  AnyThreadChannel,
  AutoModerationActionExecution,
  AutoModerationRule,
  Entitlement,
  Guild,
  Message,
  Ready,
  StageInstance,
  Subscription,
  User,
  VoiceState,
} from "../classes/index.js";

/**
 * Represents all events that can be emitted by the client.
 * This interface combines events from both REST and Gateway APIs, along with client-specific events.
 */
export interface ClientEvents extends RestEvents, GatewayEvents {
  /**
   * Emitted when an error occurs during client operation.
   * @param error The error object containing details about what went wrong
   */
  error: [error: Error];

  /**
   * Emitted when the client has successfully connected to Discord and is ready to process events.
   * This event indicates that all initial data (guilds, channels, etc.) has been received.
   * @param ready Object containing information about the ready state
   */
  ready: [ready: Ready];

  /**
   * Emitted when permissions for an application command are updated.
   * @param permissions The updated application command permissions
   */
  applicationCommandPermissionsUpdate: [
    permissions: GuildApplicationCommandPermissionEntity,
  ];

  /**
   * Emitted when a new Auto Moderation rule is created in a guild.
   * @param rule The newly created Auto Moderation rule
   */
  autoModerationRuleCreate: [rule: AutoModerationRule];

  /**
   * Emitted when an Auto Moderation rule is updated in a guild.
   * @param oldRule The rule before the update
   * @param newRule The rule after the update
   */
  autoModerationRuleUpdate: [
    oldRule: AutoModerationRule | null,
    newRule: AutoModerationRule,
  ];

  /**
   * Emitted when an Auto Moderation rule is deleted from a guild.
   * @param rule The deleted Auto Moderation rule
   */
  autoModerationRuleDelete: [rule: AutoModerationRule];

  /**
   * Emitted when an Auto Moderation rule is triggered and an action is executed.
   * @param execution Information about the executed action
   */
  autoModerationActionExecution: [execution: AutoModerationActionExecution];

  /**
   * Emitted when a new guild channel is created.
   * @param channel The newly created channel
   */
  channelCreate: [channel: AnyChannel];

  /**
   * Emitted when a channel is updated (name, topic, permissions, etc.).
   * @param oldChannel The channel before the update
   * @param newChannel The channel after the update
   */
  channelUpdate: [oldChannel: AnyChannel | null, newChannel: AnyChannel];

  /**
   * Emitted when a channel is deleted.
   * @param channel The deleted channel
   */
  channelDelete: [channel: AnyChannel];

  /**
   * Emitted when a message is pinned or unpinned in a channel.
   * @param pinUpdate Information about the pin update
   */
  channelPinsUpdate: [pinUpdate: unknown];

  /**
   * Emitted when a new thread is created or when the client is added to a private thread.
   * @param thread The newly created thread or private thread the client was added to
   */
  threadCreate: [thread: AnyThreadChannel];

  /**
   * Emitted when a thread is updated (name, archived status, auto archive duration, etc.).
   * @param oldThread The thread before the update
   * @param newThread The thread after the update
   */
  threadUpdate: [
    oldThread: AnyThreadChannel | null,
    newThread: AnyThreadChannel,
  ];

  /**
   * Emitted when a thread is deleted.
   * @param thread The deleted thread
   */
  threadDelete: [thread: AnyThreadChannel];

  /**
   * Emitted when gaining access to a channel, containing all active threads in that channel.
   * This helps synchronize thread state when joining a guild or gaining access to a channel.
   * @param threads Collection of active threads in the channel
   */
  threadListSync: [threads: unknown];

  /**
   * Emitted when the thread member object for the current user is updated.
   * @param oldMember The thread member before the update
   * @param newMember The thread member after the update
   */
  threadMemberUpdate: [oldMember: unknown | null, newMember: unknown];

  /**
   * Emitted when users are added to or removed from a thread.
   * @param update Information about the members update
   */
  threadMembersUpdate: [update: unknown];

  /**
   * Emitted when a new entitlement (subscription or one-time purchase) is created.
   * @param entitlement The newly created entitlement
   */
  entitlementCreate: [entitlement: Entitlement];

  /**
   * Emitted when an entitlement is updated.
   * @param oldEntitlement The entitlement before the update or null if it was created
   * @param newEntitlement The entitlement after the update
   */
  entitlementUpdate: [
    oldEntitlement: Entitlement | null,
    newEntitlement: Entitlement,
  ];

  /**
   * Emitted when an entitlement is deleted.
   * @param entitlement The deleted entitlement
   */
  entitlementDelete: [entitlement: Entitlement];

  /**
   * Emitted in three scenarios:
   * 1. When the client is connecting to a previously unavailable guild
   * 2. When a guild becomes available after being unavailable
   * 3. When the client user joins a new guild
   * @param guild The guild that became available or was joined
   */
  guildCreate: [guild: Guild];

  /**
   * Emitted when a guild's settings or properties are updated.
   * @param oldGuild The guild before the update
   * @param newGuild The guild after the update
   */
  guildUpdate: [oldGuild: Guild | null, newGuild: Guild];

  /**
   * Emitted when:
   * 1. A guild becomes unavailable due to an outage
   * 2. The client user leaves or is removed from a guild
   * @param guild The guild that became unavailable or was left
   */
  guildDelete: [guild: Guild];

  /**
   * Emitted when a new audit log entry is created in a guild.
   * @param entry The newly created audit log entry
   */
  guildAuditLogEntryCreate: [entry: unknown];

  /**
   * Emitted when a user is banned from a guild.
   * @param ban Information about the ban, including the user and the guild
   */
  guildBanAdd: [ban: unknown];

  /**
   * Emitted when a user is unbanned from a guild.
   * @param ban Information about the removed ban
   */
  guildBanRemove: [ban: unknown];

  /**
   * Emitted when a guild's emojis are updated (added, removed, or modified).
   * @param oldEmojis The guild's emojis before the update
   * @param newEmojis The guild's emojis after the update
   */
  guildEmojisUpdate: [oldEmojis: unknown | null, newEmojis: unknown];

  /**
   * Emitted when a guild's stickers are updated (added, removed, or modified).
   * @param oldStickers The guild's stickers before the update
   * @param newStickers The guild's stickers after the update
   */
  guildStickersUpdate: [oldStickers: unknown | null, newStickers: unknown];

  /**
   * Emitted when a guild's integrations are updated.
   * @param integrations Information about the updated integrations
   */
  guildIntegrationsUpdate: [integrations: unknown];

  /**
   * Emitted when a new user joins a guild.
   * @param member The member who joined the guild
   */
  guildMemberAdd: [member: unknown];

  /**
   * Emitted when a user leaves or is removed from a guild.
   * @param member The member who was removed from the guild
   */
  guildMemberRemove: [member: unknown];

  /**
   * Emitted when a guild member is updated (roles, nickname, etc.).
   * @param oldMember The member before the update
   * @param newMember The member after the update
   */
  guildMemberUpdate: [oldMember: unknown | null, newMember: unknown];

  /**
   * Emitted in response to a Guild Request Members request.
   * @param members The chunk of requested guild members
   */
  guildMembersChunk: [members: unknown];

  /**
   * Emitted when a role is created in a guild.
   * @param role The newly created role
   */
  guildRoleCreate: [role: unknown];

  /**
   * Emitted when a guild role is updated.
   * @param oldRole The role before the update
   * @param newRole The role after the update
   */
  guildRoleUpdate: [oldRole: unknown | null, newRole: unknown];

  /**
   * Emitted when a guild role is deleted.
   * @param role The deleted role
   */
  guildRoleDelete: [role: unknown];

  /**
   * Emitted when a scheduled event is created in a guild.
   * @param event The newly created scheduled event
   */
  guildScheduledEventCreate: [event: unknown];

  /**
   * Emitted when a scheduled event is updated in a guild.
   * @param oldEvent The scheduled event before the update
   * @param newEvent The scheduled event after the update
   */
  guildScheduledEventUpdate: [oldEvent: unknown | null, newEvent: unknown];

  /**
   * Emitted when a scheduled event is deleted from a guild.
   * @param event The deleted scheduled event
   */
  guildScheduledEventDelete: [event: unknown];

  /**
   * Emitted when a user subscribes to a guild scheduled event.
   * @param subscription Information about the subscription
   */
  guildScheduledEventUserAdd: [subscription: unknown];

  /**
   * Emitted when a user unsubscribes from a guild scheduled event.
   * @param subscription Information about the removed subscription
   */
  guildScheduledEventUserRemove: [subscription: unknown];

  /**
   * Emitted when a soundboard sound is created in a guild.
   * @param sound The newly created soundboard sound
   */
  guildSoundboardSoundCreate: [sound: unknown];

  /**
   * Emitted when a soundboard sound is updated in a guild.
   * @param oldSound The soundboard sound before the update
   * @param newSound The soundboard sound after the update
   */
  guildSoundboardSoundUpdate: [oldSound: unknown | null, newSound: unknown];

  /**
   * Emitted when a soundboard sound is deleted from a guild.
   * @param sound The deleted soundboard sound
   */
  guildSoundboardSoundDelete: [sound: unknown];

  /**
   * Emitted when a guild's soundboard sounds are updated as a whole.
   * @param sounds Information about the updated soundboard sounds
   */
  guildSoundboardSoundsUpdate: [sounds: unknown];

  /**
   * Emitted in response to a Request Soundboard Sounds request.
   * @param sounds The requested soundboard sounds
   */
  soundboardSounds: [sounds: unknown];

  /**
   * Emitted when a guild integration is created.
   * @param integration The newly created integration
   */
  integrationCreate: [integration: unknown];

  /**
   * Emitted when a guild integration is updated.
   * @param oldIntegration The integration before the update
   * @param newIntegration The integration after the update
   */
  integrationUpdate: [oldIntegration: unknown | null, newIntegration: unknown];

  /**
   * Emitted when a guild integration is deleted.
   * @param integration The deleted integration
   */
  integrationDelete: [integration: unknown];

  /**
   * Emitted when an invite to a channel is created.
   * @param invite The newly created invite
   */
  inviteCreate: [invite: unknown];

  /**
   * Emitted when an invite to a channel is deleted.
   * @param invite The deleted invite
   */
  inviteDelete: [invite: unknown];

  /**
   * Emitted when a message is sent in a channel the client can see.
   * @param message The created message
   */
  messageCreate: [message: Message];

  /**
   * Emitted when a message is edited.
   * @param oldMessage The message before the update
   * @param newMessage The message after the update
   */
  messageUpdate: [oldMessage: Message | null, newMessage: Message];

  /**
   * Emitted when a message is deleted.
   * @param message The deleted message
   */
  messageDelete: [message: Message];

  /**
   * Emitted when multiple messages are deleted at once (bulk delete).
   * @param messages The deleted messages
   */
  messageDeleteBulk: [messages: unknown];

  /**
   * Emitted when a user adds a reaction to a message.
   * @param reaction Information about the added reaction
   */
  messageReactionAdd: [reaction: unknown];

  /**
   * Emitted when a user removes a reaction from a message.
   * @param reaction Information about the removed reaction
   */
  messageReactionRemove: [reaction: unknown];

  /**
   * Emitted when all reactions are removed from a message.
   * @param removal Information about the removal
   */
  messageReactionRemoveAll: [removal: unknown];

  /**
   * Emitted when all reactions of a specific emoji are removed from a message.
   * @param removal Information about the emoji reaction removal
   */
  messageReactionRemoveEmoji: [removal: unknown];

  /**
   * Emitted when a user's presence (status, activity) is updated.
   * @param oldPresence The presence before the update
   * @param newPresence The presence after the update
   */
  presenceUpdate: [oldPresence: unknown | null, newPresence: unknown];

  /**
   * Emitted when a user starts typing in a channel.
   * @param typing Information about the typing activity
   */
  typingStart: [typing: unknown];

  /**
   * Emitted when properties about the user (username, avatar, etc.) change.
   * @param oldUser The user before the update
   * @param newUser The user after the update
   */
  userUpdate: [oldUser: User | null, newUser: User];

  /**
   * Emitted when someone sends an effect in a voice channel the client is connected to.
   * @param effect Information about the sent effect
   */
  voiceChannelEffectSend: [effect: unknown];

  /**
   * Emitted when a user joins, leaves, or moves between voice channels.
   * @param oldState The voice state before the update
   * @param newState The voice state after the update
   */
  voiceStateUpdate: [oldState: VoiceState | null, newState: VoiceState];

  /**
   * Emitted when a guild's voice server is updated.
   * This usually happens when a guild becomes available for voice connections.
   * @param server Information about the voice server update
   */
  voiceServerUpdate: [server: unknown];

  /**
   * Emitted when a webhook is created, updated, or deleted in a guild channel.
   * @param webhook Information about the webhook update
   */
  webhooksUpdate: [webhook: unknown];

  /**
   * Emitted when a user uses an interaction with the client, such as an Application Command.
   * @param interaction The created interaction
   */
  interactionCreate: [interaction: AnyInteraction];

  /**
   * Emitted when a stage instance (stage channel event) is created.
   * @param instance The created stage instance
   */
  stageInstanceCreate: [instance: StageInstance];

  /**
   * Emitted when a stage instance is updated.
   * @param oldInstance The stage instance before the update
   * @param newInstance The stage instance after the update
   */
  stageInstanceUpdate: [
    oldInstance: StageInstance | null,
    newInstance: StageInstance,
  ];

  /**
   * Emitted when a stage instance is deleted or closed.
   * @param instance The deleted stage instance
   */
  stageInstanceDelete: [instance: StageInstance];

  /**
   * Emitted when a premium app subscription is created.
   * @param subscription The created premium app subscription
   */
  subscriptionCreate: [subscription: Subscription];

  /**
   * Emitted when a premium app subscription is updated.
   * @param oldSubscription The subscription before the update
   * @param newSubscription The subscription after the update
   */
  subscriptionUpdate: [
    oldSubscription: Subscription | null,
    newSubscription: Subscription,
  ];

  /**
   * Emitted when a premium app subscription is deleted.
   * @param subscription The deleted subscription
   */
  subscriptionDelete: [subscription: Subscription];

  /**
   * Emitted when a user votes on a message poll.
   * @param vote Information about the poll vote
   */
  messagePollVoteAdd: [vote: unknown];

  /**
   * Emitted when a user removes their vote from a message poll.
   * @param vote Information about the removed poll vote
   */
  messagePollVoteRemove: [vote: unknown];
}
