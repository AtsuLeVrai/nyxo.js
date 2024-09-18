/**
 * Enum representing the various gateway opcodes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes|Gateway Opcodes}
 */
export enum GatewayOpcodes {
    /**
     * Dispatch opcode.
     */
    Dispatch = 0,
    /**
     * Heartbeat opcode.
     */
    Heartbeat = 1,
    /**
     * Identify opcode.
     */
    Identify = 2,
    /**
     * Presence Update opcode.
     */
    PresenceUpdate = 3,
    /**
     * Voice State Update opcode.
     */
    VoiceStateUpdate = 4,
    /**
     * Resume opcode.
     */
    Resume = 6,
    /**
     * Reconnect opcode.
     */
    Reconnect = 7,
    /**
     * Request Guild Members opcode.
     */
    RequestGuildMembers = 8,
    /**
     * Invalid Session opcode.
     */
    InvalidSession = 9,
    /**
     * Hello opcode.
     */
    Hello = 10,
    /**
     * Heartbeat ACK opcode.
     */
    HeartbeatAck = 11,
}

/**
 * Enum representing the various gateway close event codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes|Gateway Close Event Codes}
 */
export enum GatewayCloseCodes {
    /**
     * Unknown error.
     */
    UnknownError = 4_000,
    /**
     * Unknown opcode.
     */
    UnknownOpcode = 4_001,
    /**
     * Decode error.
     */
    DecodeError = 4_002,
    /**
     * Not authenticated.
     */
    NotAuthenticated = 4_003,
    /**
     * Authentication failed.
     */
    AuthenticationFailed = 4_004,
    /**
     * Already authenticated.
     */
    AlreadyAuthenticated = 4_005,
    /**
     * Invalid seq.
     */
    InvalidSeq = 4_007,
    /**
     * Rate limited.
     */
    RateLimited = 4_008,
    /**
     * Session timed out.
     */
    SessionTimedOut = 4_009,
    /**
     * Invalid shard.
     */
    InvalidShard = 4_010,
    /**
     * Sharding required.
     */
    ShardingRequired = 4_011,
    /**
     * Invalid API version.
     */
    InvalidApiVersion = 4_012,
    /**
     * Invalid intent(s).
     */
    InvalidIntents = 4_013,
    /**
     * Disallowed intent(s).
     */
    DisallowedIntents = 4_014,
}

/**
 * Enum representing the various voice opcodes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-opcodes|Voice Opcodes}
 */
export enum VoiceOpcodes {
    /**
     * Identify opcode.
     */
    Identify = 0,
    /**
     * Select Protocol opcode.
     */
    SelectProtocol = 1,
    /**
     * Ready opcode.
     */
    Ready = 2,
    /**
     * Heartbeat opcode.
     */
    Heartbeat = 3,
    /**
     * Session Description opcode.
     */
    SessionDescription = 4,
    /**
     * Speaking opcode.
     */
    Speaking = 5,
    /**
     * Heartbeat ACK opcode.
     */
    HeartbeatAck = 6,
    /**
     * Resume opcode.
     */
    Resume = 7,
    /**
     * Hello opcode.
     */
    Hello = 8,
    /**
     * Resumed opcode.
     */
    Resumed = 9,
    /**
     * Clients Connect opcode.
     */
    ClientsConnect = 11,
    /**
     * Client Disconnect opcode.
     */
    ClientDisconnect = 13,
    /**
     * DAVE Prepare Transition opcode.
     */
    DavePrepareTransition = 21,
    /**
     * DAVE Execute Transition opcode.
     */
    DaveExecuteTransition = 22,
    /**
     * DAVE Transition Ready opcode.
     */
    DaveTransitionReady = 23,
    /**
     * DAVE Prepare Epoch opcode.
     */
    DavePrepareEpoch = 24,
    /**
     * DAVE MLS External Sender opcode.
     */
    DaveMlsExternalSender = 25,
    /**
     * DAVE MLS Key Package opcode.
     */
    DaveMlsKeyPackage = 26,
    /**
     * DAVE MLS Proposals opcode.
     */
    DaveMlsProposals = 27,
    /**
     * DAVE MLS Commit Welcome opcode.
     */
    DaveMlsCommitWelcome = 28,
    /**
     * DAVE MLS Announce Commit Transition opcode.
     */
    DaveMlsAnnounceCommitTransition = 29,
    /**
     * DAVE MLS Welcome opcode.
     */
    DaveMlsWelcome = 30,
    /**
     * DAVE MLS Invalid Commit Welcome opcode.
     */
    DaveMlsInvalidCommitWelcome = 31,
}

/**
 * Enum representing the various voice close event codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes|Voice Close Event Codes}
 */
export enum VoiceCloseCodes {
    /**
     * Unknown error.
     */
    UnknownError = 4_000,
    /**
     * Unknown opcode.
     */
    UnknownOpcode = 4_001,
    /**
     * Decode error.
     */
    DecodeError = 4_002,
    /**
     * Not authenticated.
     */
    NotAuthenticated = 4_003,
    /**
     * Authentication failed.
     */
    AuthenticationFailed = 4_004,
    /**
     * Already authenticated.
     */
    AlreadyAuthenticated = 4_005,
    /**
     * Session no longer valid.
     */
    SessionNoLongerValid = 4_006,
    /**
     * Session timeout.
     */
    SessionTimeout = 4_009,
    /**
     * Server not found.
     */
    ServerNotFound = 4_011,
    /**
     * Unknown protocol.
     */
    UnknownProtocol = 4_012,
    /**
     * Disconnected.
     */
    Disconnected = 4_014,
    /**
     * Voice server crashed.
     */
    VoiceServerCrashed = 4_015,
    /**
     * Unknown encryption mode.
     */
    UnknownEncryptionMode = 4_016,
}

/**
 * Enum representing the various HTTP response codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#http-http-response-codes|HTTP Response Codes}
 */
export enum HttpCodes {
    /**
     * The request completed successfully.
     */
    Ok = 200,
    /**
     * The entity was created successfully.
     */
    Created = 201,
    /**
     * The request completed successfully but returned no content.
     */
    NoContent = 204,
    /**
     * The entity was not modified (no action was taken).
     */
    NotModified = 304,
    /**
     * The request was improperly formatted, or the server couldn't understand it.
     */
    BadRequest = 400,
    /**
     * The Authorization header was missing or invalid.
     */
    Unauthorized = 401,
    /**
     * The Authorization token you passed did not have permission to the resource.
     */
    Forbidden = 403,
    /**
     * The resource at the location specified doesn't exist.
     */
    NotFound = 404,
    /**
     * The HTTP method used is not valid for the location specified.
     */
    MethodNotAllowed = 405,
    /**
     * You are being rate limited, see Rate Limits.
     */
    TooManyRequests = 429,
    /**
     * There was not a gateway available to process your request. Wait a bit and retry.
     */
    GatewayUnavailable = 502,
    /**
     * The server had an error processing your request (these are rare).
     */
    ServerError = 500,
}

/**
 * Enum representing the various JSON error codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes|JSON Error Codes}
 */
export enum JsonErrorCodes {
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
    UnknownSKU = 10_027,
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
    MaximumNumberOfGroupDMsReached = 30_011,
    MaximumNumberOfGuildChannelsReached = 30_013,
    MaximumNumberOfAttachmentsInAMessageReached = 30_015,
    MaximumNumberOfInvitesReached = 30_016,
    MaximumNumberOfAnimatedEmojisReached = 30_018,
    MaximumNumberOfServerMembersReached = 30_019,
    MaximumNumberOfServerCategoriesReached = 30_030,
    GuildAlreadyHasATemplate = 30_031,
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
    MaximumNumberOfPinnedThreadsInAForumChannelReached = 30_047,
    MaximumNumberOfTagsInAForumChannelReached = 30_048,
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
    OnlyConsumableSKUsCanBeConsumed = 40_018,
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
    CannotExecuteActionOnDMChannel = 50_003,
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
    InvalidMFALevel = 50_017,
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
    InvalidAPIVersion = 50_041,
    FileUploadExceedsMaximumSize = 50_045,
    InvalidFileUploaded = 50_046,
    CannotSelfRedeemGift = 50_054,
    InvalidGuild = 50_055,
    InvalidSKU = 50_057,
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
    InvalidJSONInRequestBody = 50_109,
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
    APIResourceOverloaded = 130_000,
    StageAlreadyOpen = 150_006,
    CannotReplyWithoutPermissionToReadMessageHistory = 160_002,
    ThreadAlreadyCreatedForMessage = 160_004,
    ThreadLocked = 160_005,
    MaximumNumberOfActiveThreadsReached = 160_006,
    MaximumNumberOfActiveAnnouncementThreadsReached = 160_007,
    InvalidJSONForUploadedLottieFile = 170_001,
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
 * Enum representing the various RPC error codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes|RPC Error Codes}
 */
export enum RpcErrorCodes {
    /**
     * An unknown error occurred.
     */
    UnknownError = 1_000,
    /**
     * You sent an invalid payload.
     */
    InvalidPayload = 4_000,
    /**
     * Invalid command name specified.
     */
    InvalidCommand = 4_002,
    /**
     * Invalid guild ID specified.
     */
    InvalidGuild = 4_003,
    /**
     * Invalid event name specified.
     */
    InvalidEvent = 4_004,
    /**
     * Invalid channel ID specified.
     */
    InvalidChannel = 4_005,
    /**
     * You lack permissions to access the given resource.
     */
    InvalidPermissions = 4_006,
    /**
     * An invalid OAuth2 application ID was used to authorize or authenticate with.
     */
    InvalidClientId = 4_007,
    /**
     * An invalid OAuth2 application origin was used to authorize or authenticate with.
     */
    InvalidOrigin = 4_008,
    /**
     * An invalid OAuth2 token was used to authorize or authenticate with.
     */
    InvalidToken = 4_009,
    /**
     * The specified user ID was invalid.
     */
    InvalidUser = 4_010,
    /**
     * A standard OAuth2 error occurred; check the data object for the OAuth2 error details.
     */
    OAuth2Error = 5_000,
    /**
     * An asynchronous SELECT_TEXT_CHANNEL/SELECT_VOICE_CHANNEL command timed out.
     */
    SelectChannelTimedOut = 5_001,
    /**
     * An asynchronous GET_GUILD command timed out.
     */
    GetGuildTimedOut = 5_002,
    /**
     * You tried to join a user to a voice channel but the user was already in one.
     */
    SelectVoiceForceRequired = 5_003,
    /**
     * You tried to capture more than one shortcut key at once.
     */
    CaptureShortcutAlreadyListening = 5_004,
}

/**
 * Enum representing the various RPC close event codes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes|RPC Close Event Codes}
 */
export enum RpcCloseCodes {
    /**
     * Invalid client ID.
     */
    InvalidClientId = 4_000,
    /**
     * Invalid origin.
     */
    InvalidOrigin = 4_001,
    /**
     * Rate limited.
     */
    RateLimited = 4_002,
    /**
     * Token revoked.
     */
    TokenRevoked = 4_003,
    /**
     * Invalid version.
     */
    InvalidVersion = 4_004,
    /**
     * Invalid encoding.
     */
    InvalidEncoding = 4_005,
}
