/**
 * ./globals/*
 */
export { type AuthTypes, ApiVersions, type DiscordHeaders } from "./globals/api";
export { CDN, type CDNEvents, type ImageFormats } from "./globals/cdn";
export { type RESTMakeRequestOptions, REST, type AttachmentCDNUrlParameters, type RateLimitResponse } from "./globals/rest";

/**
 * ./routes/*
 */
export {
	type CreateTestEntitlementJSONParams,
	type ListEntitlementsQueryStringParams,
	createTestEntitlement,
	deleteTestEntitlement,
	listEntitlements,
	consumeEntitlement,
} from "./routes/entitlements";
export { type GetGatewayBotResponse, getGateway, getGatewayBot, type SessionStartLimitStructure } from "./routes/gateway";
export {
	type GetCurrentAuthorizationInformationResponse,
	getCurrentAuthorizationInformation,
	getCurrentBotApplicationInformation,
} from "./routes/oauth2";
export { listSkus } from "./routes/skus";
export {
	type CreateDMParams,
	type CreateGroupDMParams,
	createGroupDM,
	type ModifyCurrentUserParams,
	getCurrentUser,
	getCurrentUserGuilds,
	getCurrentUserConnections,
	getCurrentUserGuildMember,
	type GetCurrentUserGuildsQueryStringParams,
	type UpdateCurrentUserApplicationRoleConnectionParams,
	getUser,
	modifyCurrentUser,
	getCurrentUserApplicationRoleConnection,
	updateCurrentUserApplicationRoleConnection,
	leaveGuild,
} from "./routes/users";
export { listVoiceRegions } from "./routes/voices";

/**
 * ./structures/*
 */
export {
	ApplicationIntegrationTypes,
	ApplicationFlags,
	ApplicationRoleConnectionMetadataTypes,
	type ApplicationRoleConnectionMetadataStructure,
	type ApplicationStructure,
	type ApplicationIntegrationTypeConfigurationStructure,
	type InstallParamsStructure,
} from "./structures/applications";
export {
	type OptionalAuditEntryInfo,
	AuditLogEvents,
	type AuditLogStructure,
	type AuditLogEntryStructure,
	type AuditLogChangeStructure,
} from "./structures/audits";
export {
	type AllowedMentionsStructure,
	AllowedMentionTypes,
	type ChannelMentionStructure,
	type ChannelStructure,
	type AttachmentStructure,
	ChannelFlags,
	AttachmentFlags,
	ChannelTypes,
	type DefaultReactionStructure,
	type EmbedAuthorStructure,
	type EmbedFieldStructure,
	type EmbedFooterStructure,
	type EmbedImageStructure,
	type EmbedProviderStructure,
	type EmbedStructure,
	type OverwriteStructure,
	type EmbedThumbnailStructure,
	EmbedTypes,
	type EmbedVideoStructure,
	type FollowedChannelStructure,
	type ThreadMetadataStructure,
	type ReactionStructure,
	type ForumTagStructure,
	ForumLayoutTypes,
	type MessageActivityStructure,
	MessageActivityTypes,
	type MessageCallStructure,
	MessageReferenceTypes,
	MessageTypes,
	type MessageReferenceStructure,
	type MessageSnapshotStructure,
	MessageFlags,
	type MessageStructure,
	type ThreadMemberStructure,
	type MessageInteractionMetadataStructure,
	type ReactionCountDetailsStructure,
	type RoleSubscriptionDataStructure,
	SortOrderTypes,
	VideoQualityModes,
} from "./structures/channels";
export type { EmojiStructure } from "./structures/emojis";
export { type EntitlementStructure, EntitlementTypes } from "./structures/entitlements";
export {
	type BanStructure,
	type GuildStructure,
	type GuildMemberStructure,
	GuildMemberFlags,
	type GuildOnboardingStructure,
	GuildOnboardingModes,
	type GuildOnboardingPromptStructure,
	GuildOnboardingPromptTypes,
	type GuildPreviewStructure,
	GuildFeatures,
	type GuildOnboardingPromptOptionStructure,
	DefaultMessageNotificationLevels,
	type GuildWidgetStructure,
	GuildNSFWLevels,
	GuildScheduledEventEntityTypes,
	GuildScheduledEventStatus,
	type GuildScheduledEventEntityMetadata,
	GuildScheduledEventPrivacyLevels,
	type GuildScheduledEventStructure,
	type GuildScheduledEventUserStructure,
	type GuildTemplateStructure,
	type GuildWidgetSettingsStructure,
	type IntegrationApplicationStructure,
	type IntegrationAccountStructure,
	type IntegrationStructure,
	type UnavailableGuildStructure,
	MFALevels,
	ExplicitContentFilterLevels,
	IntegrationExpireBehavior,
	VerificationLevels,
	PremiumTier,
	type WelcomeScreenStructure,
	type WelcomeScreenChannelStructure,
	SystemChannelFlags,
} from "./structures/guilds";
export {
	type ActionRowStructure,
	type ApplicationCommandInteractionDataOptionStructure,
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	ApplicationCommandPermissionTypes,
	type ApplicationCommandOptionChoiceStructure,
	type ApplicationCommandPermissionsStructure,
	type ApplicationCommandInteractionDataStructure,
	type ApplicationCommandOptionStructure,
	type ApplicationCommandStructure,
	type AutocompleteStructure,
	type ButtonStructure,
	type InteractionCallbackDataStructure,
	InteractionCallbackTypes,
	InteractionContextTypes,
	InteractionTypes,
	type GuildApplicationCommandPermissionsStructure,
	type InteractionResponseStructure,
	type InteractionStructure,
	ComponentTypes,
	type MessageInteractionStructure,
	type MessageComponentDataStructure,
	type ResolvedDataStructure,
	type ModalStructure,
	type ModalSubmitDataStructure,
	ButtonStyles,
	type SelectMenuOptionStructure,
	type SelectMenuStructure,
	type SelectDefaultValueStructure,
	type TextInputStructure,
	TextInputStyles,
} from "./structures/interactions";
export {
	type InviteMetadataStructure,
	type InviteStructure,
	type InviteStageInstanceStructure,
	InviteTypes,
	InviteTargetTypes,
} from "./structures/invites";
export {
	type AutoModerationActionMetadata,
	AutoModerationActionTypes,
	AutoModerationEventTypes,
	AutoModerationKeywordPresetTypes,
	type AutoModerationActionStructure,
	type AutoModerationRuleStructure,
	AutoModerationRuleTriggerTypes,
	type AutoModerationRuleTriggerMetadata,
} from "./structures/moderations";
export {
	type PollAnswerCountStructure,
	type PollAnswerStructure,
	type PollMediaStructure,
	type PollResultsStructure,
	type PollCreateRequestStructure,
	PollLayoutTypes,
	type PollStructure,
} from "./structures/polls";
export { RoleFlags, type RoleStructure, type RoleTagsStructure } from "./structures/roles";
export { SkuFlags, type SkuStructure, SkuTypes } from "./structures/skus";
export { type StageInstanceStructure, StagePrivacyLevels } from "./structures/stages";
export { type StickerItemStructure, type StickerPackStructure, StickersFormatTypes, StickerTypes, type StickerStructure } from "./structures/stickers";
export { MembershipStates, type TeamMemberObject, type TeamObject } from "./structures/teams";
export {
	type ApplicationRoleConnectionStructure,
	type ConnectionStructure,
	type UserStructure,
	UserFlags,
	ConnectionServices,
	type AvatarDecorationDataStructure,
	ConnectionVisibilityTypes,
	PremiumTypes,
} from "./structures/users";
export type { VoiceRegionStructure, VoiceStateStructure } from "./structures/voices";
export { type WebhookStructure, WebhookTypes } from "./structures/webhooks";
