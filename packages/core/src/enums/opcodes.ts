/**
 * Discord Communication Protocol
 *
 * This module defines the various opcodes and status codes used in Discord's
 * communication protocols, including Gateway, Voice, REST, and RPC interactions.
 *
 * @module Discord Opcodes & Status Codes
 * @version 1.0.0
 *
 * Main Documentation:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes Discord Opcodes & Status Codes}
 *
 * Gateway Related:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway Gateway Documentation}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes Gateway Opcodes}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes Gateway Close Event Codes}
 *
 * Voice Related:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice Voice Documentation}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-opcodes Voice Opcodes}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes Voice Close Event Codes}
 *
 * HTTP Related:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#http HTTP Documentation}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#http-http-response-codes HTTP Response Codes}
 *
 * JSON Error Related:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json JSON Documentation}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes JSON Error Codes}
 *
 * RPC Related:
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc RPC Documentation}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes RPC Error Codes}
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes RPC Close Event Codes}
 *
 * Additional Resources:
 * @see {@link https://discord.com/developers/docs/topics/gateway Gateway Guide}
 * @see {@link https://discord.com/developers/docs/topics/voice-connections Voice Connections}
 * @see {@link https://discord.com/developers/docs/reference Reference}
 * @see {@link https://discord.com/developers/docs/topics/rate-limits Rate Limits}
 */

/**
 * Gateway Opcodes
 *
 * Defines the operation codes used in Discord's WebSocket-based Gateway protocol.
 * These codes identify the type of payload being sent or received.
 *
 * @remarks
 * The Gateway protocol is used for:
 * - Real-time events
 * - State synchronization
 * - Heartbeat maintenance
 * - Session management
 *
 * @example
 * ```typescript
 * // Handling a gateway payload
 * function handleGatewayPayload(payload: unknown) {
 *   switch (payload.op) {
 *     case GatewayOpcodes.Dispatch:
 *       handleDispatchEvent(payload);
 *       break;
 *     case GatewayOpcodes.Heartbeat:
 *       sendHeartbeatResponse();
 *       break;
 *   }
 * }
 * ```
 */
export enum GatewayOpcodes {
    /**
     * Event dispatch
     * @remarks Client ← Server: Dispatches an event
     */
    Dispatch = 0,

    /**
     * Heartbeat
     * @remarks Client ↔ Server: Used for ping checking
     */
    Heartbeat = 1,

    /**
     * Identify
     * @remarks Client → Server: Starts a new session
     */
    Identify = 2,

    /**
     * Presence Update
     * @remarks Client → Server: Updates the client's presence
     */
    PresenceUpdate = 3,

    /**
     * Voice State Update
     * @remarks Client → Server: Used to join/leave/move between voice channels
     */
    VoiceStateUpdate = 4,

    /**
     * Resume
     * @remarks Client → Server: Resumes a closed connection
     */
    Resume = 6,

    /**
     * Reconnect
     * @remarks Client ← Server: Server asks client to reconnect
     */
    Reconnect = 7,

    /**
     * Request Guild Members
     * @remarks Client → Server: Requests members for a guild
     */
    RequestGuildMembers = 8,

    /**
     * Invalid Session
     * @remarks Client ← Server: Session is no longer valid
     */
    InvalidSession = 9,

    /**
     * Hello
     * @remarks Client ← Server: Sent immediately after connecting
     */
    Hello = 10,

    /**
     * Heartbeat ACK
     * @remarks Client ← Server: Server acknowledges heartbeat
     */
    HeartbeatAck = 11,

    /**
     * Request Soundboard Sounds
     * @remarks Client → Server: Requests available soundboard sounds
     */
    RequestSoundboardSounds = 31,
}

/**
 * Gateway Close Event Codes
 *
 * Defines the close codes sent when a Gateway connection is terminated.
 * These codes help identify the reason for the disconnection.
 *
 * @remarks
 * - 4000-4009: Common connection errors
 * - 4010-4014: Configuration/validation errors
 *
 * @example
 * ```typescript
 * // Handling gateway closure
 * websocket.onclose = (event) => {
 *   switch (event.code) {
 *     case GatewayCloseCodes.AuthenticationFailed:
 *       console.error('Invalid token provided');
 *       break;
 *     case GatewayCloseCodes.InvalidShard:
 *       console.error('Invalid shard configuration');
 *       break;
 *   }
 * };
 * ```
 */
export enum GatewayCloseCodes {
    /**
     * Unknown error
     * @remarks We're not sure what went wrong. Try reconnecting?
     */
    UnknownError = 4_000,

    /**
     * Unknown opcode
     * @remarks You sent an invalid Gateway opcode or an invalid payload for an opcode
     */
    UnknownOpcode = 4_001,

    /**
     * Decode error
     * @remarks You sent an invalid payload to Discord
     */
    DecodeError = 4_002,

    /**
     * Not authenticated
     * @remarks You sent us a payload prior to identifying
     */
    NotAuthenticated = 4_003,

    /**
     * Authentication failed
     * @remarks The account token sent with your identify payload is incorrect
     */
    AuthenticationFailed = 4_004,

    /**
     * Already authenticated
     * @remarks You sent more than one identify payload
     */
    AlreadyAuthenticated = 4_005,

    /**
     * Invalid sequence number
     * @remarks The sequence sent when resuming the session was invalid
     */
    InvalidSeq = 4_007,

    /**
     * Rate limited
     * @remarks Woah nelly! You're sending payloads too quickly
     */
    RateLimited = 4_008,

    /**
     * Session timed out
     * @remarks Your session timed out
     */
    SessionTimedOut = 4_009,

    /**
     * Invalid shard
     * @remarks You sent us an invalid shard when identifying
     */
    InvalidShard = 4_010,

    /**
     * Sharding required
     * @remarks The session would have handled too many guilds - you are required to shard
     */
    ShardingRequired = 4_011,

    /**
     * Invalid API version
     * @remarks You sent an invalid version for the gateway
     */
    InvalidApiVersion = 4_012,

    /**
     * Invalid intent(s)
     * @remarks You sent an invalid intent for a Gateway Intent
     */
    InvalidIntents = 4_013,

    /**
     * Disallowed intent(s)
     * @remarks You sent a disallowed intent for a Gateway Intent
     */
    DisallowedIntents = 4_014,
}

/**
 * Voice Communication Opcodes
 *
 * Defines the operation codes used in Discord's voice connection protocol.
 * These codes manage voice connections, state, and data transmission.
 *
 * @remarks
 * Voice opcodes handle:
 * - Voice connection establishment
 * - Protocol selection
 * - Audio transmission
 * - Connection maintenance
 * - DAVE (Discord Audio Video Engine) operations
 *
 * @example
 * ```typescript
 * // Handling voice connection
 * function handleVoicePayload(payload: any) {
 *   switch (payload.op) {
 *     case VoiceOpcodes.Ready:
 *       setupVoiceConnection(payload);
 *       break;
 *     case VoiceOpcodes.Speaking:
 *       handleUserSpeaking(payload);
 *       break;
 *   }
 * }
 * ```
 */
export enum VoiceOpcodes {
    /**
     * Identify
     * @remarks Client → Server: Begins a voice websocket connection
     */
    Identify = 0,

    /**
     * Select Protocol
     * @remarks Client → Server: Select the voice protocol and IP/Port
     */
    SelectProtocol = 1,

    /**
     * Ready
     * @remarks Client ← Server: Complete the websocket handshake
     */
    Ready = 2,

    /**
     * Heartbeat
     * @remarks Client → Server: Keep the websocket connection alive
     */
    Heartbeat = 3,

    /**
     * Session Description
     * @remarks Client ← Server: Describe the session
     */
    SessionDescription = 4,

    /**
     * Speaking
     * @remarks Client ↔ Server: Indicate which users are speaking
     */
    Speaking = 5,

    /**
     * Heartbeat ACK
     * @remarks Client ← Server: Server acknowledges heartbeat
     */
    HeartbeatAck = 6,

    /**
     * Resume
     * @remarks Client → Server: Resume a connection
     */
    Resume = 7,

    /**
     * Hello
     * @remarks Client ← Server: Server tells client to initialize
     */
    Hello = 8,

    /**
     * Resumed
     * @remarks Client ← Server: Acknowledge Resume
     */
    Resumed = 9,

    /**
     * Client Connect
     * @remarks Client ← Server: A client has connected to the voice channel
     */
    ClientsConnect = 11,

    /**
     * Client Disconnect
     * @remarks Client ← Server: A client has disconnected from the voice channel
     */
    ClientDisconnect = 13,

    // DAVE (Discord Audio Video Engine) Related Opcodes
    /**
     * DAVE Prepare Transition
     * @remarks Related to audio/video engine state changes
     */
    DavePrepareTransition = 21,

    /**
     * DAVE Execute Transition
     * @remarks Execute prepared audio/video transition
     */
    DaveExecuteTransition = 22,

    /**
     * DAVE Transition Ready
     * @remarks Indicates that transition is ready
     */
    DaveTransitionReady = 23,

    /**
     * DAVE Prepare Epoch
     * @remarks Prepare for audio/video timing epoch
     */
    DavePrepareEpoch = 24,

    /**
     * DAVE MLS External Sender
     * @remarks MLS protocol external sender handling
     */
    DaveMlsExternalSender = 25,

    /**
     * DAVE MLS Key Package
     * @remarks MLS protocol key package management
     */
    DaveMlsKeyPackage = 26,

    /**
     * DAVE MLS Proposals
     * @remarks MLS protocol proposals handling
     */
    DaveMlsProposals = 27,

    /**
     * DAVE MLS Commit Welcome
     * @remarks MLS protocol commit welcome message
     */
    DaveMlsCommitWelcome = 28,

    /**
     * DAVE MLS Announce Commit Transition
     * @remarks MLS protocol commit transition announcement
     */
    DaveMlsAnnounceCommitTransition = 29,

    /**
     * DAVE MLS Welcome
     * @remarks MLS protocol welcome message
     */
    DaveMlsWelcome = 30,

    /**
     * DAVE MLS Invalid Commit Welcome
     * @remarks MLS protocol invalid commit welcome handling
     */
    DaveMlsInvalidCommitWelcome = 31,
}

/**
 * Voice Connection Close Codes
 *
 * Defines the close codes used when a voice connection is terminated.
 * These codes help identify why the voice connection was closed.
 *
 * @remarks
 * - 4000-4006: Authentication/validation errors
 * - 4009-4016: Connection/protocol errors
 *
 * @example
 * ```typescript
 * // Handling voice connection closure
 * voiceConnection.onclose = (event) => {
 *   switch (event.code) {
 *     case VoiceCloseCodes.SessionTimeout:
 *       reconnectVoice();
 *       break;
 *     case VoiceCloseCodes.ServerNotFound:
 *       handleServerError();
 *       break;
 *   }
 * };
 * ```
 */
export enum VoiceCloseCodes {
    /**
     * Unknown Error
     * @remarks An unknown error occurred during voice connection
     */
    UnknownError = 4_000,

    /**
     * Unknown Opcode
     * @remarks An invalid opcode was sent
     */
    UnknownOpcode = 4_001,

    /**
     * Decode Error
     * @remarks Failed to decode payload
     */
    DecodeError = 4_002,

    /**
     * Not Authenticated
     * @remarks Voice connection not authenticated
     */
    NotAuthenticated = 4_003,

    /**
     * Authentication Failed
     * @remarks Authentication of voice connection failed
     */
    AuthenticationFailed = 4_004,

    /**
     * Already Authenticated
     * @remarks Voice connection already authenticated
     */
    AlreadyAuthenticated = 4_005,

    /**
     * Session Invalid
     * @remarks Session is no longer valid
     */
    SessionNoLongerValid = 4_006,

    /**
     * Session Timeout
     * @remarks Voice session timed out
     */
    SessionTimeout = 4_009,

    /**
     * Server Not Found
     * @remarks Unable to find the voice server
     */
    ServerNotFound = 4_011,

    /**
     * Unknown Protocol
     * @remarks Unknown voice protocol selected
     */
    UnknownProtocol = 4_012,

    /**
     * Disconnected
     * @remarks Disconnected from voice channel
     */
    Disconnected = 4_014,

    /**
     * Voice Server Crashed
     * @remarks Voice server crashed
     */
    VoiceServerCrashed = 4_015,

    /**
     * Unknown Encryption Mode
     * @remarks Unknown encryption mode selected
     */
    UnknownEncryptionMode = 4_016,
}

/**
 * HTTP Response Codes
 *
 * Defines the standard HTTP response codes used by Discord's REST API.
 * These codes indicate the success or failure of API requests.
 *
 * @remarks
 * Code categories:
 * - 2xx: Success
 * - 3xx: Redirection
 * - 4xx: Client errors
 * - 5xx: Server errors
 *
 * @example
 * ```typescript
 * async function makeDiscordRequest(endpoint: string) {
 *   const response = await fetch(endpoint);
 *   switch (response.status) {
 *     case RestHttpResponseCodes.Ok:
 *       return await response.json();
 *     case RestHttpResponseCodes.TooManyRequests:
 *       throw new Error('Rate limited!');
 *     case RestHttpResponseCodes.Unauthorized:
 *       throw new Error('Invalid token!');
 *   }
 * }
 * ```
 */
export enum RestHttpResponseCodes {
    /**
     * OK (200)
     * @remarks Request completed successfully
     */
    Ok = 200,

    /**
     * Created (201)
     * @remarks Entity was created successfully
     */
    Created = 201,

    /**
     * No Content (204)
     * @remarks Request succeeded but no content returned
     */
    NoContent = 204,

    /**
     * Not Modified (304)
     * @remarks Entity was not modified (no action taken)
     */
    NotModified = 304,

    /**
     * Bad Request (400)
     * @remarks Request was improperly formatted or invalid
     */
    BadRequest = 400,

    /**
     * Unauthorized (401)
     * @remarks Missing or invalid authentication
     */
    Unauthorized = 401,

    /**
     * Forbidden (403)
     * @remarks Valid token but insufficient permissions
     */
    Forbidden = 403,

    /**
     * Not Found (404)
     * @remarks Resource does not exist
     */
    NotFound = 404,

    /**
     * Method Not Allowed (405)
     * @remarks HTTP method not valid for this endpoint
     */
    MethodNotAllowed = 405,

    /**
     * Too Many Requests (429)
     * @remarks You are being rate limited
     */
    TooManyRequests = 429,

    /**
     * Gateway Unavailable (502)
     * @remarks Discord's gateway is not available
     */
    GatewayUnavailable = 502,

    /**
     * Server Error (500)
     * @remarks Discord server error (rare)
     */
    ServerError = 500,
}

/**
 * REST API JSON Error Codes
 *
 * Defines specific error codes returned in JSON responses from Discord's REST API.
 * These codes provide detailed information about why a request failed.
 *
 * @remarks
 * Code categories:
 * - 10xxx: Resource errors
 * - 20xxx: Permission/Authorization errors
 * - 30xxx: Limit errors
 * - 40xxx: Request errors
 * - 50xxx: Resource errors
 * - Others: Miscellaneous errors
 *
 * @example
 * ```typescript
 * async function handleApiError(error: any) {
 *   switch (error.code) {
 *     case RestJsonErrorCodes.RateLimited:
 *       await sleep(error.retry_after);
 *       break;
 *     case RestJsonErrorCodes.MissingAccess:
 *       throw new Error('Bot lacks required permissions');
 *       break;
 *   }
 * }
 * ```
 */
export enum RestJsonErrorCodes {
    GeneralError = 0,
    UnknownAccount = 10_001,
    UnknownApplication = 10_002,
    UnknownChannel = 10_003,
    UnknownGuild = 10_004,
    UnknownIntegration = 10_005,
    UnknownInvite = 10_006,
    UnknownMember = 10_007,
    UnknownMessage = 10_008,
    UnknownPermissionOverwrite = 10_009,
    UnknownProvider = 10_010,
    UnknownRole = 10_011,
    UnknownToken = 10_012,
    UnknownUser = 10_013,
    UnknownEmoji = 10_014,
    UnknownWebhook = 10_015,
    UnknownWebhookService = 10_016,
    UnknownSession = 10_020,
    UnknownBan = 10_026,
    UnknownSku = 10_027,
    UnknownStoreListing = 10_028,
    UnknownEntitlement = 10_029,
    UnknownBuild = 10_030,
    UnknownLobby = 10_031,
    UnknownBranch = 10_032,
    UnknownStoreDirectoryLayout = 10_033,
    UnknownRedistributable = 10_036,
    UnknownGiftCode = 10_038,
    UnknownStream = 10_049,
    UnknownPremiumServerSubscribeCooldown = 10_050,
    UnknownGuildTemplate = 10_057,
    UnknownDiscoverableServerCategory = 10_059,
    UnknownSticker = 10_060,
    UnknownStickerPack = 10_061,
    UnknownInteraction = 10_062,
    UnknownApplicationCommand = 10_063,
    UnknownVoiceState = 10_065,
    UnknownApplicationCommandPermissions = 10_066,
    UnknownStageInstance = 10_067,
    UnknownGuildMemberVerificationForm = 10_068,
    UnknownGuildWelcomeScreen = 10_069,
    UnknownGuildScheduledEvent = 10_070,
    UnknownGuildScheduledEventUser = 10_071,
    UnknownTag = 10_087,
    BotsCannotUseThisEndpoint = 20_001,
    OnlyBotsCanUseThisEndpoint = 20_002,
    ExplicitContentCannotBeSentToTheDesiredRecipients = 20_009,
    NotAuthorizedToPerformThisActionOnThisApplication = 20_012,
    ActionCannotBePerformedDueToSlowmodeRateLimit = 20_016,
    OnlyTheOwnerOfThisAccountCanPerformThisAction = 20_018,
    MessageCannotBeEditedDueToAnnouncementRateLimits = 20_022,
    UnderMinimumAge = 20_024,
    ChannelHasHitTheWriteRateLimit = 20_028,
    ServerHasHitTheWriteRateLimit = 20_029,
    StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords = 20_031,
    GuildPremiumSubscriptionLevelTooLow = 20_035,
    MaximumNumberOfGuildsReached = 30_001,
    MaximumNumberOfFriendsReached = 30_002,
    MaximumNumberOfPinsReachedForTheChannel = 30_003,
    MaximumNumberOfRecipientsReached = 30_004,
    MaximumNumberOfGuildRolesReached = 30_005,
    MaximumNumberOfWebhooksReached = 30_007,
    MaximumNumberOfEmojisReached = 30_008,
    MaximumNumberOfReactionsReached = 30_010,
    MaximumNumberOfGroupDmsReached = 30_011,
    MaximumNumberOfGuildChannelsReached = 30_013,
    MaximumNumberOfAttachmentsInMessageReached = 30_015,
    MaximumNumberOfInvitesReached = 30_016,
    MaximumNumberOfAnimatedEmojisReached = 30_018,
    MaximumNumberOfServerMembersReached = 30_019,
    MaximumNumberOfServerCategoriesReached = 30_030,
    GuildAlreadyHasTemplate = 30_031,
    MaximumNumberOfApplicationCommandsReached = 30_032,
    MaximumNumberOfThreadParticipantsReached = 30_033,
    MaximumNumberOfDailyApplicationCommandCreatesReached = 30_034,
    MaximumNumberOfBansForNonGuildMembersExceeded = 30_035,
    MaximumNumberOfBanFetchesReached = 30_037,
    MaximumNumberOfUncompletedGuildScheduledEventsReached = 30_038,
    MaximumNumberOfStickersReached = 30_039,
    MaximumNumberOfPruneRequestsReached = 30_040,
    MaximumNumberOfGuildWidgetSettingsUpdatesReached = 30_042,
    MaximumNumberOfEditsToMessagesOlderThan1HourReached = 30_046,
    MaximumNumberOfPinnedThreadsInForumChannelReached = 30_047,
    MaximumNumberOfTagsInForumChannelReached = 30_048,
    BitrateIsTooHighForChannelOfThisType = 30_052,
    MaximumNumberOfPremiumEmojisReached = 30_056,
    MaximumNumberOfWebhooksPerGuildReached = 30_058,
    MaximumNumberOfChannelPermissionOverwritesReached = 30_060,
    ChannelsForThisGuildAreTooLarge = 30_061,
    Unauthorized = 40_001,
    VerificationRequired = 40_002,
    OpeningDirectMessagesTooFast = 40_003,
    SendMessagesTemporarilyDisabled = 40_004,
    RequestEntityTooLarge = 40_005,
    FeatureTemporarilyDisabledServerSide = 40_006,
    UserBannedFromGuild = 40_007,
    ConnectionRevoked = 40_012,
    OnlyConsumableSkusCanBeConsumed = 40_018,
    OnlySandboxEntitlementsCanBeDeleted = 40_019,
    TargetUserNotConnectedToVoice = 40_032,
    MessageAlreadyCrossposted = 40_033,
    ApplicationCommandWithThatNameAlreadyExists = 40_041,
    ApplicationInteractionFailedToSend = 40_043,
    CannotSendMessageInForumChannel = 40_058,
    InteractionAlreadyAcknowledged = 40_060,
    TagNamesMustBeUnique = 40_061,
    ServiceResourceBeingRateLimited = 40_062,
    NoTagsAvailableForNonModerators = 40_066,
    TagRequiredToCreateForumPost = 40_067,
    EntitlementAlreadyGrantedForResource = 40_074,
    InteractionHitMaximumNumberOfFollowUpMessages = 40_094,
    CloudflareBlocking = 40_333,
    MissingAccess = 50_001,
    InvalidAccountType = 50_002,
    CannotExecuteActionOnDmChannel = 50_003,
    GuildWidgetDisabled = 50_004,
    CannotEditMessageByAnotherUser = 50_005,
    CannotSendEmptyMessage = 50_006,
    CannotSendMessagesToUser = 50_007,
    CannotSendMessagesInNonTextChannel = 50_008,
    ChannelVerificationLevelTooHigh = 50_009,
    OAuth2ApplicationDoesNotHaveBot = 50_010,
    OAuth2ApplicationLimitReached = 50_011,
    InvalidOAuth2State = 50_012,
    LackPermissionsToPerformAction = 50_013,
    InvalidAuthenticationTokenProvided = 50_014,
    NoteTooLong = 50_015,
    TooFewOrTooManyMessagesToDelete = 50_016,
    InvalidMfaLevel = 50_017,
    MessageCanOnlyBePinnedToOriginChannel = 50_019,
    InviteCodeInvalidOrTaken = 50_020,
    CannotExecuteActionOnSystemMessage = 50_021,
    CannotExecuteActionOnChannelType = 50_024,
    InvalidOAuth2AccessToken = 50_025,
    MissingRequiredOAuth2Scope = 50_026,
    InvalidWebhookTokenProvided = 50_027,
    InvalidRole = 50_028,
    InvalidRecipients = 50_033,
    MessageTooOldToBulkDelete = 50_034,
    InvalidFormBody = 50_035,
    InviteAcceptedToGuildBotNotIn = 50_036,
    InvalidActivityAction = 50_039,
    InvalidApiVersion = 50_041,
    FileUploadExceedsMaximumSize = 50_045,
    InvalidFileUploaded = 50_046,
    CannotSelfRedeemGift = 50_054,
    InvalidGuild = 50_055,
    InvalidSku = 50_057,
    InvalidRequestOrigin = 50_067,
    InvalidMessageType = 50_068,
    PaymentSourceRequiredToRedeemGift = 50_070,
    CannotModifySystemWebhook = 50_073,
    CannotDeleteRequiredCommunityChannel = 50_074,
    CannotEditStickersWithinMessage = 50_080,
    InvalidStickerSent = 50_081,
    CannotPerformActionOnArchivedThread = 50_083,
    InvalidThreadNotificationSettings = 50_084,
    BeforeValueEarlierThanThreadCreationDate = 50_085,
    CommunityServerChannelsMustBeTextChannels = 50_086,
    EntityTypeMismatch = 50_091,
    ServerNotAvailableInLocation = 50_095,
    ServerNeedsMonetizationEnabled = 50_097,
    ServerNeedsMoreBoosts = 50_101,
    InvalidJsonInRequestBody = 50_109,
    OwnerCannotBePendingMember = 50_131,
    OwnershipCannotBeTransferredToBot = 50_132,
    FailedToResizeAssetBelowMaximumSize = 50_138,
    CannotMixSubscriptionAndNonSubscriptionRoles = 50_144,
    CannotConvertBetweenPremiumAndNormalEmoji = 50_145,
    UploadedFileNotFound = 50_146,
    VoiceMessagesDoNotSupportAdditionalContent = 50_159,
    VoiceMessagesMustHaveSingleAudioAttachment = 50_160,
    VoiceMessagesMustHaveSupportingMetadata = 50_161,
    VoiceMessagesCannotBeEdited = 50_162,
    CannotDeleteGuildSubscriptionIntegration = 50_163,
    CannotSendVoiceMessagesInThisChannel = 50_173,
    UserAccountMustBeVerified = 50_178,
    NoPermissionToSendSticker = 50_600,
    TwoFactorRequired = 60_003,
    NoUsersWithDiscordTagExist = 80_004,
    ReactionBlocked = 90_001,
    UserCannotUseBurstReactions = 90_002,
    ApplicationNotYetAvailable = 110_001,
    ApiResourceOverloaded = 130_000,
    StageAlreadyOpen = 150_006,
    CannotReplyWithoutPermissionToReadMessageHistory = 160_002,
    ThreadAlreadyCreatedForMessage = 160_004,
    ThreadLocked = 160_005,
    MaximumNumberOfActiveThreadsReached = 160_006,
    MaximumNumberOfActiveAnnouncementThreadsReached = 160_007,
    InvalidJsonForUploadedLottieFile = 170_001,
    UploadedLottiesCannotContainRasterizedImages = 170_002,
    StickerMaximumFramerateExceeded = 170_003,
    StickerFrameCountExceedsMaximum = 170_004,
    LottieAnimationMaximumDimensionsExceeded = 170_005,
    StickerFrameRateInvalid = 170_006,
    StickerAnimationDurationExceedsMaximum = 170_007,
    CannotUpdateFinishedEvent = 180_000,
    FailedToCreateStageNeededForStageEvent = 180_002,
    MessageBlockedByAutomaticModeration = 200_000,
    TitleBlockedByAutomaticModeration = 200_001,
    WebhooksPostedToForumChannelsMustHaveThreadNameOrId = 220_001,
    WebhooksCannotHaveBothThreadNameAndId = 220_002,
    WebhooksCanOnlyCreateThreadsInForumChannels = 220_003,
    WebhookServicesCannotBeUsedInForumChannels = 220_004,
    MessageBlockedByHarmfulLinksFilter = 240_000,
    CannotEnableOnboarding = 350_000,
    CannotUpdateOnboardingWhileBelowRequirements = 350_001,
    FailedToBanUsers = 500_000,
    PollVotingBlocked = 520_000,
    PollExpired = 520_001,
    InvalidChannelTypeForPollCreation = 520_002,
    CannotEditPollMessage = 520_003,
    CannotUseEmojiIncludedWithPoll = 520_004,
    CannotExpireNonPollMessage = 520_006,
}

/**
 * RPC Error Codes
 *
 * Defines error codes that can occur during RPC communication with Discord.
 * These codes help identify specific issues in RPC operations.
 *
 * @remarks
 * Code categories:
 * - 1000: General errors
 * - 4000-4010: Protocol errors
 * - 5000-5004: Implementation errors
 *
 * @example
 * ```typescript
 * // Handling RPC errors
 * function handleRpcError(code: RpcErrorCodes, message: string) {
 *   switch (code) {
 *     case RpcErrorCodes.InvalidPayload:
 *       console.error('Invalid data sent:', message);
 *       break;
 *     case RpcErrorCodes.InvalidClientId:
 *       console.error('Client ID verification failed');
 *       break;
 *   }
 * }
 * ```
 */
export enum RpcErrorCodes {
    /**
     * Unknown Error
     * @remarks An unknown error occurred during RPC communication
     * @action Check the error message for more details
     */
    UnknownError = 1_000,

    /**
     * Invalid Payload
     * @remarks The sent payload was malformed or invalid
     * @action Verify the payload structure and content
     */
    InvalidPayload = 4_000,

    /**
     * Invalid Command
     * @remarks The command name specified was invalid
     * @action Check command spelling and availability
     */
    InvalidCommand = 4_002,

    /**
     * Invalid Guild
     * @remarks The guild ID provided was invalid
     * @action Verify the guild ID exists and is accessible
     */
    InvalidGuild = 4_003,

    /**
     * Invalid Event
     * @remarks The event name specified was invalid
     * @action Check event name spelling and registration
     */
    InvalidEvent = 4_004,

    /**
     * Invalid Channel
     * @remarks The channel ID provided was invalid
     * @action Verify channel ID exists and is accessible
     */
    InvalidChannel = 4_005,

    /**
     * Invalid Permissions
     * @remarks The application lacks required permissions
     * @action Check required vs granted permissions
     */
    InvalidPermissions = 4_006,

    /**
     * Invalid Client ID
     * @remarks The application ID was invalid
     * @action Verify your application's client ID
     */
    InvalidClientId = 4_007,

    /**
     * Invalid Origin
     * @remarks The origin the application is running from is not valid
     * @action Check allowed origins in your application settings
     */
    InvalidOrigin = 4_008,

    /**
     * Invalid Token
     * @remarks The provided authentication token was invalid
     * @action Verify token validity and permissions
     */
    InvalidToken = 4_009,

    /**
     * Invalid User
     * @remarks The specified user ID was invalid
     * @action Check if user exists and is accessible
     */
    InvalidUser = 4_010,

    /**
     * OAuth2 Error
     * @remarks A standard OAuth2 error occurred
     * @remarks Check the data object for OAuth2 error details
     */
    OAuth2Error = 5_000,

    /**
     * Select Channel Timed Out
     * @remarks Channel selection operation timed out
     * @action Retry the operation or check for UI blocking
     */
    SelectChannelTimedOut = 5_001,

    /**
     * Get Guild Timed Out
     * @remarks Guild fetch operation timed out
     * @action Check network connection and retry
     */
    GetGuildTimedOut = 5_002,

    /**
     * Select Voice Force Required
     * @remarks Cannot join user to voice - already in voice
     * @action Force move user or handle existing connection
     */
    SelectVoiceForceRequired = 5_003,

    /**
     * Capture Shortcut Already Listening
     * @remarks Cannot capture multiple shortcut keys simultaneously
     * @action Handle one shortcut at a time
     */
    CaptureShortcutAlreadyListening = 5_004,
}

/**
 * RPC Close Event Codes
 *
 * Defines close codes sent when an RPC connection is terminated.
 * These codes help identify why the connection was closed.
 *
 * @remarks
 * All codes are in the 4000-4005 range
 * Each code represents a specific reason for connection termination
 *
 * @example
 * ```typescript
 * // Handling RPC connection closure
 * rpcConnection.onclose = (event) => {
 *   switch (event.code) {
 *     case RpcCloseCodes.InvalidClientId:
 *       console.error('Invalid client ID - check your application settings');
 *       break;
 *     case RpcCloseCodes.InvalidOrigin:
 *       console.error('Connection from unauthorized origin');
 *       break;
 *   }
 * };
 * ```
 */
export enum RpcCloseCodes {
    /**
     * Invalid Client ID
     * @remarks The provided client ID was invalid
     * @action Verify your application's client ID in Discord Developer Portal
     */
    InvalidClientId = 4_000,

    /**
     * Invalid Origin
     * @remarks Connection attempted from an invalid origin
     * @action Check allowed origins in your application settings
     */
    InvalidOrigin = 4_001,

    /**
     * Rate Limited
     * @remarks Too many requests made to the RPC server
     * @action Implement rate limiting or backoff strategy
     */
    RateLimited = 4_002,

    /**
     * Token Revoked
     * @remarks The OAuth2 token was revoked
     * @action Re-authenticate the user
     */
    TokenRevoked = 4_003,

    /**
     * Invalid Version
     * @remarks Invalid RPC version specified
     * @action Check supported RPC versions
     */
    InvalidVersion = 4_004,

    /**
     * Invalid Encoding
     * @remarks Invalid encoding specified
     * @action Use only supported encodings (JSON)
     */
    InvalidEncoding = 4_005,
}
