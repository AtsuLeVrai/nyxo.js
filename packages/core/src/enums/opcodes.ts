/**
 * Enum representing the various gateway opcodes used by Discord.
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
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes|Gateway Close Event Codes}
 */
export enum GatewayCloseCodes {
    /**
     * Unknown error.
     */
    UnknownError = 4000,
    /**
     * Unknown opcode.
     */
    UnknownOpcode = 4001,
    /**
     * Decode error.
     */
    DecodeError = 4002,
    /**
     * Not authenticated.
     */
    NotAuthenticated = 4003,
    /**
     * Authentication failed.
     */
    AuthenticationFailed = 4004,
    /**
     * Already authenticated.
     */
    AlreadyAuthenticated = 4005,
    /**
     * Invalid seq.
     */
    InvalidSeq = 4007,
    /**
     * Rate limited.
     */
    RateLimited = 4008,
    /**
     * Session timed out.
     */
    SessionTimedOut = 4009,
    /**
     * Invalid shard.
     */
    InvalidShard = 4010,
    /**
     * Sharding required.
     */
    ShardingRequired = 4011,
    /**
     * Invalid API version.
     */
    InvalidApiVersion = 4012,
    /**
     * Invalid intent(s).
     */
    InvalidIntents = 4013,
    /**
     * Disallowed intent(s).
     */
    DisallowedIntents = 4014,
}

/**
 * Enum representing the various voice opcodes used by Discord.
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
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes|Voice Close Event Codes}
 */
export enum VoiceCloseCodes {
    /**
     * Unknown error.
     */
    UnknownError = 4000,
    /**
     * Unknown opcode.
     */
    UnknownOpcode = 4001,
    /**
     * Decode error.
     */
    DecodeError = 4002,
    /**
     * Not authenticated.
     */
    NotAuthenticated = 4003,
    /**
     * Authentication failed.
     */
    AuthenticationFailed = 4004,
    /**
     * Already authenticated.
     */
    AlreadyAuthenticated = 4005,
    /**
     * Session no longer valid.
     */
    SessionNoLongerValid = 4006,
    /**
     * Session timeout.
     */
    SessionTimeout = 4009,
    /**
     * Server not found.
     */
    ServerNotFound = 4011,
    /**
     * Unknown protocol.
     */
    UnknownProtocol = 4012,
    /**
     * Disconnected.
     */
    Disconnected = 4014,
    /**
     * Voice server crashed.
     */
    VoiceServerCrashed = 4015,
    /**
     * Unknown encryption mode.
     */
    UnknownEncryptionMode = 4016,
}

/**
 * Enum representing the various HTTP response codes used by Discord.
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
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes|JSON Error Codes}
 */
export enum JsonErrorCodes {
    GeneralError = 0,
    UnknownAccount = 10001,
    UnknownApplication = 10002,
    UnknownChannel = 10003,
    UnknownGuild = 10004,
    UnknownIntegration = 10005,
    UnknownInvite = 10006,
    UnknownMember = 10007,
    UnknownMessage = 10008,
    UnknownPermissionOverwrite = 10009,
    UnknownProvider = 10010,
    UnknownRole = 10011,
    UnknownToken = 10012,
    UnknownUser = 10013,
    UnknownEmoji = 10014,
    UnknownWebhook = 10015,
    UnknownWebhookService = 10016,
    UnknownSession = 10020,
    UnknownBan = 10026,
    UnknownSKU = 10027,
    UnknownStoreListing = 10028,
    UnknownEntitlement = 10029,
    UnknownBuild = 10030,
    UnknownLobby = 10031,
    UnknownBranch = 10032,
    UnknownStoreDirectoryLayout = 10033,
    UnknownRedistributable = 10036,
    UnknownGiftCode = 10038,
    UnknownStream = 10049,
    UnknownPremiumServerSubscribeCooldown = 10050,
    UnknownGuildTemplate = 10057,
    UnknownDiscoverableServerCategory = 10059,
    UnknownSticker = 10060,
    UnknownStickerPack = 10061,
    UnknownInteraction = 10062,
    UnknownApplicationCommand = 10063,
    UnknownVoiceState = 10065,
    UnknownApplicationCommandPermissions = 10066,
    UnknownStageInstance = 10067,
    UnknownGuildMemberVerificationForm = 10068,
    UnknownGuildWelcomeScreen = 10069,
    UnknownGuildScheduledEvent = 10070,
    UnknownGuildScheduledEventUser = 10071,
    UnknownTag = 10087,
    BotsCannotUseThisEndpoint = 20001,
    OnlyBotsCanUseThisEndpoint = 20002,
    ExplicitContentCannotBeSentToTheDesiredRecipients = 20009,
    NotAuthorizedToPerformThisActionOnThisApplication = 20012,
    ActionCannotBePerformedDueToSlowmodeRateLimit = 20016,
    OnlyTheOwnerOfThisAccountCanPerformThisAction = 20018,
    MessageCannotBeEditedDueToAnnouncementRateLimits = 20022,
    UnderMinimumAge = 20024,
    ChannelHasHitTheWriteRateLimit = 20028,
    ServerHasHitTheWriteRateLimit = 20029,
    StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords = 20031,
    GuildPremiumSubscriptionLevelTooLow = 20035,
    MaximumNumberOfGuildsReached = 30001,
    MaximumNumberOfFriendsReached = 30002,
    MaximumNumberOfPinsReachedForTheChannel = 30003,
    MaximumNumberOfRecipientsReached = 30004,
    MaximumNumberOfGuildRolesReached = 30005,
    MaximumNumberOfWebhooksReached = 30007,
    MaximumNumberOfEmojisReached = 30008,
    MaximumNumberOfReactionsReached = 30010,
    MaximumNumberOfGroupDMsReached = 30011,
    MaximumNumberOfGuildChannelsReached = 30013,
    MaximumNumberOfAttachmentsInAMessageReached = 30015,
    MaximumNumberOfInvitesReached = 30016,
    MaximumNumberOfAnimatedEmojisReached = 30018,
    MaximumNumberOfServerMembersReached = 30019,
    MaximumNumberOfServerCategoriesReached = 30030,
    GuildAlreadyHasATemplate = 30031,
    MaximumNumberOfApplicationCommandsReached = 30032,
    MaximumNumberOfThreadParticipantsReached = 30033,
    MaximumNumberOfDailyApplicationCommandCreatesReached = 30034,
    MaximumNumberOfBansForNonGuildMembersExceeded = 30035,
    MaximumNumberOfBanFetchesReached = 30037,
    MaximumNumberOfUncompletedGuildScheduledEventsReached = 30038,
    MaximumNumberOfStickersReached = 30039,
    MaximumNumberOfPruneRequestsReached = 30040,
    MaximumNumberOfGuildWidgetSettingsUpdatesReached = 30042,
    MaximumNumberOfEditsToMessagesOlderThan1HourReached = 30046,
    MaximumNumberOfPinnedThreadsInAForumChannelReached = 30047,
    MaximumNumberOfTagsInAForumChannelReached = 30048,
    BitrateIsTooHighForChannelOfThisType = 30052,
    MaximumNumberOfPremiumEmojisReached = 30056,
    MaximumNumberOfWebhooksPerGuildReached = 30058,
    MaximumNumberOfChannelPermissionOverwritesReached = 30060,
    ChannelsForThisGuildAreTooLarge = 30061,
    Unauthorized = 40001,
    VerificationRequired = 40002,
    OpeningDirectMessagesTooFast = 40003,
    SendMessagesTemporarilyDisabled = 40004,
    RequestEntityTooLarge = 40005,
    FeatureTemporarilyDisabledServerSide = 40006,
    UserBannedFromGuild = 40007,
    ConnectionRevoked = 40012,
    OnlyConsumableSKUsCanBeConsumed = 40018,
    OnlySandboxEntitlementsCanBeDeleted = 40019,
    TargetUserNotConnectedToVoice = 40032,
    MessageAlreadyCrossposted = 40033,
    ApplicationCommandWithThatNameAlreadyExists = 40041,
    ApplicationInteractionFailedToSend = 40043,
    CannotSendMessageInForumChannel = 40058,
    InteractionAlreadyAcknowledged = 40060,
    TagNamesMustBeUnique = 40061,
    ServiceResourceBeingRateLimited = 40062,
    NoTagsAvailableForNonModerators = 40066,
    TagRequiredToCreateForumPost = 40067,
    EntitlementAlreadyGrantedForResource = 40074,
    InteractionHitMaximumNumberOfFollowUpMessages = 40094,
    CloudflareBlocking = 40333,
    MissingAccess = 50001,
    InvalidAccountType = 50002,
    CannotExecuteActionOnDMChannel = 50003,
    GuildWidgetDisabled = 50004,
    CannotEditMessageByAnotherUser = 50005,
    CannotSendEmptyMessage = 50006,
    CannotSendMessagesToUser = 50007,
    CannotSendMessagesInNonTextChannel = 50008,
    ChannelVerificationLevelTooHigh = 50009,
    OAuth2ApplicationDoesNotHaveBot = 50010,
    OAuth2ApplicationLimitReached = 50011,
    InvalidOAuth2State = 50012,
    LackPermissionsToPerformAction = 50013,
    InvalidAuthenticationTokenProvided = 50014,
    NoteTooLong = 50015,
    TooFewOrTooManyMessagesToDelete = 50016,
    InvalidMFALevel = 50017,
    MessageCanOnlyBePinnedToOriginChannel = 50019,
    InviteCodeInvalidOrTaken = 50020,
    CannotExecuteActionOnSystemMessage = 50021,
    CannotExecuteActionOnChannelType = 50024,
    InvalidOAuth2AccessToken = 50025,
    MissingRequiredOAuth2Scope = 50026,
    InvalidWebhookTokenProvided = 50027,
    InvalidRole = 50028,
    InvalidRecipients = 50033,
    MessageTooOldToBulkDelete = 50034,
    InvalidFormBody = 50035,
    InviteAcceptedToGuildBotNotIn = 50036,
    InvalidActivityAction = 50039,
    InvalidAPIVersion = 50041,
    FileUploadExceedsMaximumSize = 50045,
    InvalidFileUploaded = 50046,
    CannotSelfRedeemGift = 50054,
    InvalidGuild = 50055,
    InvalidSKU = 50057,
    InvalidRequestOrigin = 50067,
    InvalidMessageType = 50068,
    PaymentSourceRequiredToRedeemGift = 50070,
    CannotModifySystemWebhook = 50073,
    CannotDeleteRequiredCommunityChannel = 50074,
    CannotEditStickersWithinMessage = 50080,
    InvalidStickerSent = 50081,
    CannotPerformActionOnArchivedThread = 50083,
    InvalidThreadNotificationSettings = 50084,
    BeforeValueEarlierThanThreadCreationDate = 50085,
    CommunityServerChannelsMustBeTextChannels = 50086,
    EntityTypeMismatch = 50091,
    ServerNotAvailableInLocation = 50095,
    ServerNeedsMonetizationEnabled = 50097,
    ServerNeedsMoreBoosts = 50101,
    InvalidJSONInRequestBody = 50109,
    OwnerCannotBePendingMember = 50131,
    OwnershipCannotBeTransferredToBot = 50132,
    FailedToResizeAssetBelowMaximumSize = 50138,
    CannotMixSubscriptionAndNonSubscriptionRoles = 50144,
    CannotConvertBetweenPremiumAndNormalEmoji = 50145,
    UploadedFileNotFound = 50146,
    VoiceMessagesDoNotSupportAdditionalContent = 50159,
    VoiceMessagesMustHaveSingleAudioAttachment = 50160,
    VoiceMessagesMustHaveSupportingMetadata = 50161,
    VoiceMessagesCannotBeEdited = 50162,
    CannotDeleteGuildSubscriptionIntegration = 50163,
    CannotSendVoiceMessagesInThisChannel = 50173,
    UserAccountMustBeVerified = 50178,
    NoPermissionToSendSticker = 50600,
    TwoFactorRequired = 60003,
    NoUsersWithDiscordTagExist = 80004,
    ReactionBlocked = 90001,
    UserCannotUseBurstReactions = 90002,
    ApplicationNotYetAvailable = 110001,
    APIResourceOverloaded = 130000,
    StageAlreadyOpen = 150006,
    CannotReplyWithoutPermissionToReadMessageHistory = 160002,
    ThreadAlreadyCreatedForMessage = 160004,
    ThreadLocked = 160005,
    MaximumNumberOfActiveThreadsReached = 160006,
    MaximumNumberOfActiveAnnouncementThreadsReached = 160007,
    InvalidJSONForUploadedLottieFile = 170001,
    UploadedLottiesCannotContainRasterizedImages = 170002,
    StickerMaximumFramerateExceeded = 170003,
    StickerFrameCountExceedsMaximum = 170004,
    LottieAnimationMaximumDimensionsExceeded = 170005,
    StickerFrameRateInvalid = 170006,
    StickerAnimationDurationExceedsMaximum = 170007,
    CannotUpdateFinishedEvent = 180000,
    FailedToCreateStageNeededForStageEvent = 180002,
    MessageBlockedByAutomaticModeration = 200000,
    TitleBlockedByAutomaticModeration = 200001,
    WebhooksPostedToForumChannelsMustHaveThreadNameOrId = 220001,
    WebhooksCannotHaveBothThreadNameAndId = 220002,
    WebhooksCanOnlyCreateThreadsInForumChannels = 220003,
    WebhookServicesCannotBeUsedInForumChannels = 220004,
    MessageBlockedByHarmfulLinksFilter = 240000,
    CannotEnableOnboarding = 350000,
    CannotUpdateOnboardingWhileBelowRequirements = 350001,
    FailedToBanUsers = 500000,
    PollVotingBlocked = 520000,
    PollExpired = 520001,
    InvalidChannelTypeForPollCreation = 520002,
    CannotEditPollMessage = 520003,
    CannotUseEmojiIncludedWithPoll = 520004,
    CannotExpireNonPollMessage = 520006,
}

/**
 * Enum representing the various RPC error codes used by Discord.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes|RPC Error Codes}
 */
export enum RpcErrorCodes {
    /**
     * An unknown error occurred.
     */
    UnknownError = 1000,
    /**
     * You sent an invalid payload.
     */
    InvalidPayload = 4000,
    /**
     * Invalid command name specified.
     */
    InvalidCommand = 4002,
    /**
     * Invalid guild ID specified.
     */
    InvalidGuild = 4003,
    /**
     * Invalid event name specified.
     */
    InvalidEvent = 4004,
    /**
     * Invalid channel ID specified.
     */
    InvalidChannel = 4005,
    /**
     * You lack permissions to access the given resource.
     */
    InvalidPermissions = 4006,
    /**
     * An invalid OAuth2 application ID was used to authorize or authenticate with.
     */
    InvalidClientId = 4007,
    /**
     * An invalid OAuth2 application origin was used to authorize or authenticate with.
     */
    InvalidOrigin = 4008,
    /**
     * An invalid OAuth2 token was used to authorize or authenticate with.
     */
    InvalidToken = 4009,
    /**
     * The specified user ID was invalid.
     */
    InvalidUser = 4010,
    /**
     * A standard OAuth2 error occurred; check the data object for the OAuth2 error details.
     */
    OAuth2Error = 5000,
    /**
     * An asynchronous SELECT_TEXT_CHANNEL/SELECT_VOICE_CHANNEL command timed out.
     */
    SelectChannelTimedOut = 5001,
    /**
     * An asynchronous GET_GUILD command timed out.
     */
    GetGuildTimedOut = 5002,
    /**
     * You tried to join a user to a voice channel but the user was already in one.
     */
    SelectVoiceForceRequired = 5003,
    /**
     * You tried to capture more than one shortcut key at once.
     */
    CaptureShortcutAlreadyListening = 5004,
}

/**
 * Enum representing the various RPC close event codes used by Discord.
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes|RPC Close Event Codes}
 */
export enum RpcCloseCodes {
    /**
     * Invalid client ID.
     */
    InvalidClientId = 4000,
    /**
     * Invalid origin.
     */
    InvalidOrigin = 4001,
    /**
     * Rate limited.
     */
    RateLimited = 4002,
    /**
     * Token revoked.
     */
    TokenRevoked = 4003,
    /**
     * Invalid version.
     */
    InvalidVersion = 4004,
    /**
     * Invalid encoding.
     */
    InvalidEncoding = 4005,
}
