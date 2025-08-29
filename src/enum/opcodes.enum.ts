/**
 * @description Discord Gateway opcodes for WebSocket communication with the Discord Gateway.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
 */
export enum GatewayOpcodes {
  /** An event was dispatched */
  Dispatch = 0,
  /** Fired periodically by the client to keep the connection alive */
  Heartbeat = 1,
  /** Starts a new session during the initial handshake */
  Identify = 2,
  /** Update the client's presence */
  PresenceUpdate = 3,
  /** Used to join/leave or move between voice channels */
  VoiceStateUpdate = 4,
  /** Resume a previous session that was disconnected */
  Resume = 6,
  /** You should attempt to reconnect and resume immediately */
  Reconnect = 7,
  /** Request information about offline guild members in a large guild */
  RequestGuildMembers = 8,
  /** The session has been invalidated. You should reconnect and identify/resume accordingly */
  InvalidSession = 9,
  /** Sent immediately after connecting, contains the heartbeat_interval to use */
  Hello = 10,
  /** Sent in response to receiving a heartbeat to acknowledge that it has been received */
  HeartbeatAck = 11,
  /** Request guild soundboard sounds */
  RequestSoundboardSounds = 31,
}

/**
 * @description Discord Gateway close event codes indicating why a connection was closed.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
 */
export enum GatewayCloseEventCodes {
  /** We're not sure what went wrong. Try reconnecting? */
  UnknownError = 4000,
  /** You sent an invalid Gateway opcode or an invalid payload for an opcode */
  UnknownOpcode = 4001,
  /** You sent an invalid payload to Discord */
  DecodeError = 4002,
  /** You sent us a payload prior to identifying */
  NotAuthenticated = 4003,
  /** The account token sent with your identify payload is incorrect */
  AuthenticationFailed = 4004,
  /** You sent more than one identify payload */
  AlreadyAuthenticated = 4005,
  /** The sequence sent when resuming the session was invalid */
  InvalidSeq = 4007,
  /** You're sending payloads to us too quickly. Slow it down! */
  RateLimited = 4008,
  /** Your session timed out. Reconnect and start a new one */
  SessionTimedOut = 4009,
  /** You sent us an invalid shard when identifying */
  InvalidShard = 4010,
  /** The session would have handled too many guilds - you are required to shard your connection */
  ShardingRequired = 4011,
  /** You sent an invalid version for the gateway */
  InvalidApiVersion = 4012,
  /** You sent an invalid intent for a Gateway Intent */
  InvalidIntents = 4013,
  /** You sent a disallowed intent for a Gateway Intent */
  DisallowedIntents = 4014,
}

/**
 * @description Discord Voice Gateway opcodes for WebSocket communication with Discord Voice connections.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-opcodes}
 */
export enum VoiceOpcodes {
  /** Begin a voice websocket connection */
  Identify = 0,
  /** Select the voice protocol */
  SelectProtocol = 1,
  /** Complete the websocket handshake */
  Ready = 2,
  /** Keep the websocket connection alive */
  Heartbeat = 3,
  /** Describe the session */
  SessionDescription = 4,
  /** Indicate which users are speaking */
  Speaking = 5,
  /** Sent to acknowledge a received client heartbeat */
  HeartbeatAck = 6,
  /** Resume a connection */
  Resume = 7,
  /** Time to wait between sending heartbeats in milliseconds */
  Hello = 8,
  /** Acknowledge a successful session resume */
  Resumed = 9,
  /** A client has connected to the voice channel */
  ClientsConnect = 11,
  /** A client has disconnected from the voice channel */
  ClientDisconnect = 13,
  /** DAVE protocol - Prepare transition */
  DavePrepareTransition = 21,
  /** DAVE protocol - Execute transition */
  DaveExecuteTransition = 22,
  /** DAVE protocol - Transition ready */
  DaveTransitionReady = 23,
  /** DAVE protocol - Prepare epoch */
  DavePrepareEpoch = 24,
  /** DAVE protocol - MLS external sender */
  DaveMlsExternalSender = 25,
  /** DAVE protocol - MLS key package */
  DaveMlsKeyPackage = 26,
  /** DAVE protocol - MLS proposals */
  DaveMlsProposals = 27,
  /** DAVE protocol - MLS commit welcome */
  DaveMlsCommitWelcome = 28,
  /** DAVE protocol - MLS announce commit transition */
  DaveMlsAnnounceCommitTransition = 29,
  /** DAVE protocol - MLS welcome */
  DaveMlsWelcome = 30,
  /** DAVE protocol - MLS invalid commit welcome */
  DaveMlsInvalidCommitWelcome = 31,
}

/**
 * @description Discord Voice close event codes indicating why a voice connection was closed.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes}
 */
export enum VoiceCloseEventCodes {
  /** You sent an invalid opcode */
  UnknownOpcode = 4001,
  /** You sent a invalid payload in your identifying to the Gateway */
  FailedToDecodePayload = 4002,
  /** You sent a payload before identifying with the Gateway */
  NotAuthenticated = 4003,
  /** The token you sent in your identify payload is incorrect */
  AuthenticationFailed = 4004,
  /** You sent more than one identify payload */
  AlreadyAuthenticated = 4005,
  /** Your session is no longer valid */
  SessionNoLongerValid = 4006,
  /** Your session has timed out */
  SessionTimeout = 4009,
  /** We can't find the server you're trying to connect to */
  ServerNotFound = 4011,
  /** We didn't recognize the protocol you sent */
  UnknownProtocol = 4012,
  /** Channel was deleted, you were kicked, voice server changed, or the main gateway session was dropped */
  Disconnected = 4014,
  /** The voice server crashed */
  VoiceServerCrashed = 4015,
  /** We didn't recognize your encryption */
  UnknownEncryptionMode = 4016,
  /** You sent a bad request */
  BadRequest = 4020,
  /** You were disconnected for being rate limited */
  DisconnectedRateLimited = 4021,
  /** The call was terminated */
  DisconnectedCallTerminated = 4022,
}

/**
 * @description Standard HTTP response status codes used by Discord's REST API.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#http-http-response-codes}
 */
export enum HttpResponseCodes {
  /** The request completed successfully */
  Ok = 200,
  /** The entity was created successfully */
  Created = 201,
  /** The request completed successfully but returned no content */
  NoContent = 204,
  /** The entity was not modified (no action was taken) */
  NotModified = 304,
  /** The request was improperly formatted, or the server couldn't understand it */
  BadRequest = 400,
  /** The Authorization header was missing or invalid */
  Unauthorized = 401,
  /** The Authorization token you passed did not have permission to the resource */
  Forbidden = 403,
  /** The resource at the location specified doesn't exist */
  NotFound = 404,
  /** The HTTP method used is not valid for the location specified */
  MethodNotAllowed = 405,
  /** You are being rate limited */
  TooManyRequests = 429,
  /** There was not a gateway available to process your request. Wait a bit and retry */
  GatewayUnavailable = 502,
}

/**
 * @description Discord JSON error codes returned by the REST API for various error conditions.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes}
 */
export enum JsonErrorCodes {
  /** General error (such as a malformed request body, amongst other things) */
  GeneralError = 0,
  /** Unknown account */
  UnknownAccount = 10001,
  /** Unknown application */
  UnknownApplication = 10002,
  /** Unknown channel */
  UnknownChannel = 10003,
  /** Unknown guild */
  UnknownGuild = 10004,
  /** Unknown integration */
  UnknownIntegration = 10005,
  /** Unknown invite */
  UnknownInvite = 10006,
  /** Unknown member */
  UnknownMember = 10007,
  /** Unknown message */
  UnknownMessage = 10008,
  /** Unknown permission overwrite */
  UnknownPermissionOverwrite = 10009,
  /** Unknown provider */
  UnknownProvider = 10010,
  /** Unknown role */
  UnknownRole = 10011,
  /** Unknown token */
  UnknownToken = 10012,
  /** Unknown user */
  UnknownUser = 10013,
  /** Unknown emoji */
  UnknownEmoji = 10014,
  /** Unknown webhook */
  UnknownWebhook = 10015,
  /** Unknown webhook service */
  UnknownWebhookService = 10016,
  /** Unknown session */
  UnknownSession = 10020,
  /** Unknown ban */
  UnknownBan = 10026,
  /** Unknown SKU */
  UnknownSku = 10027,
  /** Unknown Store Listing */
  UnknownStoreListing = 10028,
  /** Unknown entitlement */
  UnknownEntitlement = 10029,
  /** Unknown build */
  UnknownBuild = 10030,
  /** Unknown lobby */
  UnknownLobby = 10031,
  /** Unknown branch */
  UnknownBranch = 10032,
  /** Unknown store directory layout */
  UnknownStoreDirectoryLayout = 10033,
  /** Unknown redistributable */
  UnknownRedistributable = 10036,
  /** Unknown gift code */
  UnknownGiftCode = 10038,
  /** Unknown stream */
  UnknownStream = 10049,
  /** Unknown premium server subscribe cooldown */
  UnknownPremiumServerSubscribeCooldown = 10050,
  /** Unknown guild template */
  UnknownGuildTemplate = 10057,
  /** Unknown discoverable server category */
  UnknownDiscoverableServerCategory = 10059,
  /** Unknown sticker */
  UnknownSticker = 10060,
  /** Unknown sticker pack */
  UnknownStickerPack = 10061,
  /** Unknown interaction */
  UnknownInteraction = 10062,
  /** Unknown application command */
  UnknownApplicationCommand = 10063,
  /** Unknown voice state */
  UnknownVoiceState = 10065,
  /** Unknown application command permissions */
  UnknownApplicationCommandPermissions = 10066,
  /** Unknown Stage Instance */
  UnknownStageInstance = 10067,
  /** Unknown Guild Member Verification Form */
  UnknownGuildMemberVerificationForm = 10068,
  /** Unknown Guild Welcome Screen */
  UnknownGuildWelcomeScreen = 10069,
  /** Unknown Guild Scheduled Event */
  UnknownGuildScheduledEvent = 10070,
  /** Unknown Guild Scheduled Event User */
  UnknownGuildScheduledEventUser = 10071,
  /** Unknown Tag */
  UnknownTag = 10087,
  /** Bots cannot use this endpoint */
  BotsCannotUse = 20001,
  /** Only bots can use this endpoint */
  OnlyBotsCanUse = 20002,
  /** Explicit content cannot be sent to the desired recipient(s) */
  ExplicitContentCannotBeSent = 20009,
  /** You are not authorized to perform this action on this application */
  NotAuthorizedForApplication = 20012,
  /** This action cannot be performed due to slowmode rate limit */
  SlowmodeRateLimit = 20016,
  /** Only the owner of this account can perform this action */
  OnlyOwnerCanPerform = 20018,
  /** This message cannot be edited due to announcement rate limits */
  AnnouncementEditRateLimit = 20022,
  /** Under minimum age */
  UnderMinimumAge = 20024,
  /** The channel you are writing has hit the write rate limit */
  ChannelWriteRateLimit = 20028,
  /** The write action you are performing on the server has hit the write rate limit */
  ServerWriteRateLimit = 20029,
  /** Your Stage topic, server name, server description, or channel names contain words that are not allowed */
  StageTopicContainsNotAllowedWords = 20031,
  /** Guild premium subscription level too low */
  GuildPremiumSubscriptionLevelTooLow = 20035,
  /** Maximum number of guilds reached (100) */
  MaximumGuildsReached = 30001,
  /** Maximum number of friends reached (1000) */
  MaximumFriendsReached = 30002,
  /** Maximum number of pins reached for the channel (50) */
  MaximumPinsReached = 30003,
  /** Maximum number of recipients reached (10) */
  MaximumRecipientsReached = 30004,
  /** Maximum number of guild roles reached (250) */
  MaximumGuildRolesReached = 30005,
  /** Maximum number of webhooks reached (15) */
  MaximumWebhooksReached = 30007,
  /** Maximum number of emojis reached */
  MaximumEmojisReached = 30008,
  /** Maximum number of reactions reached (20) */
  MaximumReactionsReached = 30010,
  /** Maximum number of group DMs reached (10) */
  MaximumGroupDmsReached = 30011,
  /** Maximum number of guild channels reached (500) */
  MaximumGuildChannelsReached = 30013,
  /** Maximum number of attachments in a message reached (10) */
  MaximumAttachmentsReached = 30015,
  /** Maximum number of invites reached (1000) */
  MaximumInvitesReached = 30016,
  /** Maximum number of animated emojis reached */
  MaximumAnimatedEmojisReached = 30018,
  /** Maximum number of server members reached */
  MaximumServerMembersReached = 30019,
  /** Maximum number of server categories has been reached (5) */
  MaximumServerCategoriesReached = 30030,
  /** Guild already has a template */
  GuildAlreadyHasTemplate = 30031,
  /** Maximum number of application commands reached */
  MaximumApplicationCommandsReached = 30032,
  /** Maximum number of thread participants has been reached (1000) */
  MaximumThreadParticipantsReached = 30033,
  /** Maximum number of daily application command creates has been reached (200) */
  MaximumDailyApplicationCommandCreatesReached = 30034,
  /** Maximum number of bans for non-guild members have been exceeded */
  MaximumNonGuildMemberBansExceeded = 30035,
  /** Maximum number of bans fetches has been reached */
  MaximumBanFetchesReached = 30037,
  /** Maximum number of uncompleted guild scheduled events reached (100) */
  MaximumUncompletedGuildScheduledEventsReached = 30038,
  /** Maximum number of stickers reached */
  MaximumStickersReached = 30039,
  /** Maximum number of prune requests has been reached. Try again later */
  MaximumPruneRequestsReached = 30040,
  /** Unauthorized. Provide a valid token and try again */
  Unauthorized = 40001,
  /** You need to verify your account in order to perform this action */
  AccountVerificationRequired = 40002,
  /** You are opening direct messages too fast */
  OpeningDirectMessagesTooFast = 40003,
  /** Send messages has been temporarily disabled */
  SendMessagesTemporarilyDisabled = 40004,
  /** Request entity too large. Try sending something smaller in size */
  RequestEntityTooLarge = 40005,
  /** This feature has been temporarily disabled server-side */
  FeatureTemporarilyDisabled = 40006,
  /** The user is banned from this guild */
  UserBannedFromGuild = 40007,
  /** Connection has been revoked */
  ConnectionRevoked = 40012,
  /** Target user is not connected to voice */
  TargetUserNotConnectedToVoice = 40032,
  /** This message has already been crossposted */
  MessageAlreadyCrossposted = 40033,
  /** An application command with that name already exists */
  ApplicationCommandNameAlreadyExists = 40041,
  /** Application interaction failed to send */
  ApplicationInteractionFailedToSend = 40043,
  /** Cannot send a message in a forum channel */
  CannotSendMessageInForumChannel = 40058,
  /** Interaction has already been acknowledged */
  InteractionAlreadyAcknowledged = 40060,
  /** Tag names must be unique */
  TagNamesMustBeUnique = 40061,
  /** Service resource is being rate limited */
  ServiceResourceRateLimited = 40062,
  /** There are no tags available that can be set by non-moderators */
  NoTagsAvailableForNonModerators = 40066,
  /** A tag is required to create a forum post in this channel */
  TagRequiredToCreateForumPost = 40067,
  /** An entitlement has already been granted for this resource */
  EntitlementAlreadyGranted = 40074,
  /** Missing access */
  MissingAccess = 50001,
  /** Invalid account type */
  InvalidAccountType = 50002,
  /** Cannot execute action on a DM channel */
  CannotExecuteOnDm = 50003,
  /** Guild widget disabled */
  GuildWidgetDisabled = 50004,
  /** Cannot edit a message authored by another user */
  CannotEditMessageByAnotherUser = 50005,
  /** Cannot send an empty message */
  CannotSendEmptyMessage = 50006,
  /** Cannot send messages to this user */
  CannotSendMessagesToUser = 50007,
  /** Cannot send messages in a non-text channel */
  CannotSendMessagesInNonTextChannel = 50008,
  /** Channel verification level is too high for you to gain access */
  ChannelVerificationLevelTooHigh = 50009,
  /** OAuth2 application does not have a bot */
  OAuth2ApplicationDoesNotHaveBot = 50010,
  /** OAuth2 application limit reached */
  OAuth2ApplicationLimitReached = 50011,
  /** Invalid OAuth2 state */
  InvalidOAuth2State = 50012,
  /** You lack permissions to perform that action */
  InsufficientPermissions = 50013,
  /** Invalid authentication token provided */
  InvalidAuthToken = 50014,
  /** Note was too long */
  NoteTooLong = 50015,
  /** Provided too few or too many messages to delete */
  ProvidedTooFewOrTooManyMessagesToDelete = 50016,
  /** Invalid MFA Level */
  InvalidMfaLevel = 50017,
  /** A message can only be pinned to the channel it was sent in */
  MessageCanOnlyBePinnedInOriginChannel = 50019,
  /** Invite code was either invalid or taken */
  InviteCodeInvalidOrTaken = 50020,
  /** Cannot execute action on a system message */
  CannotExecuteActionOnSystemMessage = 50021,
  /** Cannot execute action on this channel type */
  CannotExecuteActionOnChannelType = 50024,
  /** Invalid OAuth2 access token provided */
  InvalidOAuth2AccessToken = 50025,
  /** Missing required OAuth2 scope */
  MissingRequiredOAuth2Scope = 50026,
  /** Invalid webhook token provided */
  InvalidWebhookToken = 50027,
  /** Invalid role */
  InvalidRole = 50028,
  /** Invalid Recipient(s) */
  InvalidRecipients = 50033,
  /** A message provided was too old to bulk delete */
  MessageTooOldToBulkDelete = 50034,
  /** Invalid form body (returned for both application/json and multipart/form-data bodies) */
  InvalidFormBody = 50035,
  /** An invite was accepted to a guild the application's bot is not in */
  InviteAcceptedToGuildBotNotIn = 50036,
  /** Invalid Activity Action */
  InvalidActivityAction = 50039,
  /** Invalid API version provided */
  InvalidApiVersionProvided = 50041,
  /** File uploaded exceeds the maximum size */
  FileUploadedExceedsMaximumSize = 50045,
  /** Invalid file uploaded */
  InvalidFileUploaded = 50046,
  /** Two factor is required for this operation */
  TwoFactorRequired = 60003,
  /** No users with DiscordTag exist */
  NoUsersWithDiscordTagExist = 80004,
  /** Reaction was blocked */
  ReactionWasBlocked = 90001,
  /** Application not yet available. Try again later */
  ApplicationNotYetAvailable = 110001,
  /** Cannot reply without permission to read message history */
  CannotReplyWithoutReadMessageHistoryPermission = 160002,
  /** Invalid JSON for uploaded Lottie file */
  InvalidJsonForUploadedLottieFile = 170001,
  /** Sticker maximum framerate exceeded */
  StickerMaximumFramerateExceeded = 170003,
  /** Failed to create stage needed for stage event */
  FailedToCreateStageForStageEvent = 180002,
  /** Title was blocked by automatic moderation */
  TitleBlockedByAutoModeration = 200001,
  /** Webhooks can only create threads in forum channels */
  WebhooksCanOnlyCreateThreadsInForumChannels = 220003,
}
