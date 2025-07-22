import type { Snowflake } from "@nyxojs/core";
import { z } from "zod";

/**
 * Type representing a complete URL to Discord's primary CDN endpoint.
 *
 * This type ensures compile-time safety for Discord CDN URLs and provides
 * intelligent type inference for URL construction utilities.
 *
 * @template T - The specific path string for the CDN resource
 *
 * @example
 * ```typescript
 * const iconUrl: CdnUrl<`icons/${string}/${string}.png`> =
 *   "https://cdn.discordapp.com/icons/123456/abcdef.png";
 * ```
 *
 * @public
 */
export type CdnUrl<T extends string = string> =
  `https://cdn.discordapp.com/${T}`;

/**
 * Type representing a complete URL to Discord's media proxy endpoint.
 *
 * The media proxy is specifically optimized for animated content delivery
 * and provides enhanced processing capabilities for GIF and other dynamic assets.
 *
 * @template T - The specific path string for the media proxy resource
 *
 * @remarks
 * Media proxy URLs are primarily used for:
 * - Animated GIF stickers for better performance
 * - Large animated assets that benefit from additional processing
 * - Content that requires transcoding or optimization
 *
 * @example
 * ```typescript
 * const animatedSticker: MediaProxyUrl<`stickers/${string}.gif`> =
 *   "https://media.discordapp.net/stickers/123456789012345678.gif";
 * ```
 *
 * @public
 */
export type MediaProxyUrl<T extends string = string> =
  `https://media.discordapp.net/${T}`;

/**
 * Union type representing any valid Discord CDN URL from either endpoint.
 *
 * This is the most flexible CDN URL type that accepts resources from both
 * the primary CDN and the media proxy, enabling seamless handling of all
 * Discord asset types.
 *
 * @template T - The specific path string for the resource
 *
 * @remarks
 * Discord uses two primary domains for content delivery:
 * - `cdn.discordapp.com` for most static resources (avatars, icons, banners)
 * - `media.discordapp.net` for animated content and media requiring processing
 *
 * The choice between endpoints is typically handled automatically by the CDN
 * utility functions based on content type and optimization requirements.
 *
 * @example
 * ```typescript
 * // Static avatar from primary CDN
 * const staticAvatar: AnyCdnUrl = "https://cdn.discordapp.com/avatars/123/abc.png";
 *
 * // Animated sticker from media proxy
 * const animatedSticker: AnyCdnUrl = "https://media.discordapp.net/stickers/456/def.gif";
 *
 * // Function accepting any CDN URL
 * function processAsset(url: AnyCdnUrl) {
 *   // Handle both CDN types uniformly
 * }
 * ```
 *
 * @see {@link CdnUrl} - For primary CDN endpoint URLs
 * @see {@link MediaProxyUrl} - For media proxy endpoint URLs
 *
 * @public
 */
export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

/**
 * Utility type for extracting the path component from any CDN URL type.
 *
 * This type-level function strips the domain portion from CDN URL types,
 * leaving only the path segment for use in URL construction utilities
 * and internal processing functions.
 *
 * @template T - The CDN URL type to extract the path from
 *
 * @remarks
 * Path extraction behavior:
 * - CdnUrl types: Extracts path after "https://cdn.discordapp.com/"
 * - MediaProxyUrl types: Extracts path after "https://media.discordapp.net/"
 * - Type safety: Returns never for invalid input types
 * - Internal use: Primarily used by buildUrl and URL construction functions
 *
 * @example
 * ```typescript
 * // Type-level path extraction
 * type AvatarPath = ExtractPath<UserAvatarUrl>;
 * // Result: `avatars/${Snowflake}/${string}.${AnimatedFormat}${string}`
 *
 * type EmojiPath = ExtractPath<EmojiUrl>;
 * // Result: `emojis/${Snowflake}.${AnimatedFormat}${string}`
 *
 * // Used internally in buildUrl function
 * function buildUrl<T extends AnyCdnUrl>(path: ExtractPath<T>) {
 *   // Path is properly typed based on T
 * }
 * ```
 *
 * @see {@link AnyCdnUrl} - For the base CDN URL union type
 * @see {@link Cdn.buildUrl} - For the primary consumer of extracted paths
 *
 * @internal
 */
type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

/**
 * Type representing a Discord emoji URL with comprehensive format support.
 *
 * Emoji URLs support both static and animated formats with automatic
 * format detection based on the emoji's properties and user preferences.
 *
 * @remarks
 * Discord emojis follow a consistent URL structure:
 * - Path: `emojis/{emoji_id}.{format}`
 * - Supported formats: PNG (static), GIF (animated), WebP (static, smaller size)
 * - Size parameter: Optional query parameter for resizing (16-4096px, powers of 2)
 *
 * Animated emojis automatically use GIF format when animation is requested,
 * while static emojis default to PNG for maximum compatibility.
 *
 * @example
 * ```typescript
 * // Static emoji with default PNG format
 * const staticEmoji: EmojiUrl = "https://cdn.discordapp.com/emojis/123456789012345678.png";
 *
 * // Animated emoji with size parameter
 * const animatedEmoji: EmojiUrl = "https://cdn.discordapp.com/emojis/987654321098765432.gif?size=128";
 *
 * // WebP format for reduced bandwidth
 * const webpEmoji: EmojiUrl = "https://cdn.discordapp.com/emojis/555666777888999000.webp?size=64";
 * ```
 *
 * @see {@link Cdn.emoji} - For programmatic emoji URL generation
 * @see {@link AnimatedFormat} - For supported emoji formats
 *
 * @public
 */
export type EmojiUrl = CdnUrl<`emojis/${Snowflake}.${AnimatedFormat}${string}`>;

/**
 * Type representing a guild icon URL with animation support.
 *
 * Guild icons can be either static or animated, with automatic format
 * detection based on the icon hash prefix and user preferences.
 *
 * @remarks
 * Guild icon behavior:
 * - Static icons: Hash without "a_" prefix, supports PNG/JPEG/WebP formats
 * - Animated icons: Hash with "a_" prefix, supports GIF format for animation
 * - Fallback: When animated icon is viewed by non-Nitro users, Discord serves static version
 * - Size limits: 1024x1024px for non-boosted guilds, higher for boosted guilds
 *
 * @example
 * ```typescript
 * // Static guild icon
 * const staticIcon: GuildIconUrl = "https://cdn.discordapp.com/icons/123456789012345678/abcdef1234567890.png?size=256";
 *
 * // Animated guild icon (hash starts with "a_")
 * const animatedIcon: GuildIconUrl = "https://cdn.discordapp.com/icons/123456789012345678/a_fedcba0987654321.gif?size=512";
 * ```
 *
 * @see {@link Cdn.guildIcon} - For programmatic guild icon URL generation
 * @see {@link ANIMATED_HASH} - For detecting animated icon hashes
 *
 * @public
 */
export type GuildIconUrl =
  CdnUrl<`icons/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing a guild splash image URL for invite backgrounds.
 *
 * Splash images appear as background visuals on guild invite screens
 * and server discovery listings, providing visual branding for guilds.
 *
 * @remarks
 * Guild splash specifications:
 * - Format: Always static images (PNG, JPEG, WebP only)
 * - Dimensions: Recommended 960x540px (16:9 aspect ratio)
 * - File size: Maximum 8MB for upload
 * - Availability: Requires guild level 1 (boost level) or higher
 * - Usage: Displayed on invite links and server discovery
 *
 * @example
 * ```typescript
 * // High-quality splash for server discovery
 * const splash: GuildSplashUrl = "https://cdn.discordapp.com/splashes/123456789012345678/landscape_image_hash.png?size=2048";
 *
 * // Compressed splash for mobile clients
 * const mobileSplash: GuildSplashUrl = "https://cdn.discordapp.com/splashes/123456789012345678/landscape_image_hash.webp?size=960";
 * ```
 *
 * @see {@link Cdn.guildSplash} - For programmatic splash URL generation
 * @see {@link RasterFormat} - For supported static image formats
 *
 * @public
 */
export type GuildSplashUrl =
  CdnUrl<`splashes/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a guild discovery splash URL for server discovery.
 *
 * Discovery splash images appear specifically in Discord's server discovery
 * section, providing additional visual representation for public guilds.
 *
 * @remarks
 * Discovery splash features:
 * - Purpose: Enhanced visibility in Discord's server discovery system
 * - Format: Static images only (PNG, JPEG, WebP)
 * - Dimensions: Optimized for discovery card layout (16:9 recommended)
 * - Eligibility: Available to guilds eligible for server discovery
 * - Distinction: Separate from regular invite splash images
 *
 * @example
 * ```typescript
 * // Discovery splash optimized for discovery cards
 * const discoverySplash: GuildDiscoverySplashUrl =
 *   "https://cdn.discordapp.com/discovery-splashes/123456789012345678/discovery_optimized_hash.png?size=512";
 * ```
 *
 * @see {@link Cdn.guildDiscoverySplash} - For programmatic discovery splash URL generation
 * @see {@link GuildSplashUrl} - For regular guild invite splashes
 *
 * @public
 */
export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a guild banner URL with animation support.
 *
 * Guild banners appear at the top of the channel list and provide
 * prominent visual branding for Discord servers.
 *
 * @remarks
 * Guild banner specifications:
 * - Location: Displayed at the top of the guild's channel list
 * - Animation: Supports both static and animated formats
 * - Dimensions: 960x540px recommended (16:9 aspect ratio)
 * - Availability: Requires guild boost level 2 or higher
 * - Visibility: Shown to all guild members regardless of boost status
 *
 * @example
 * ```typescript
 * // Static guild banner
 * const staticBanner: GuildBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/banner_hash.png?size=1024";
 *
 * // Animated guild banner for boosted servers
 * const animatedBanner: GuildBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/a_animated_banner.gif?size=1024";
 * ```
 *
 * @see {@link Cdn.guildBanner} - For programmatic guild banner URL generation
 * @see {@link UserBannerUrl} - For individual user profile banners
 *
 * @public
 */
export type GuildBannerUrl =
  CdnUrl<`banners/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing a user profile banner URL with animation support.
 *
 * User banners appear on individual user profiles, providing personal
 * visual customization and expression for Discord users.
 *
 * @remarks
 * User banner features:
 * - Location: Displayed on user profile popups and full profile views
 * - Animation: Static banners for all users, animated for Nitro subscribers
 * - Dimensions: 600x240px recommended aspect ratio
 * - Availability: All users can upload static banners, Nitro users can use animated
 * - Personalization: Represents individual user identity and preferences
 *
 * @example
 * ```typescript
 * // Standard user profile banner
 * const userBanner: UserBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/user_banner_hash.png?size=600";
 *
 * // Animated banner for Nitro users
 * const nitroBanner: UserBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/a_nitro_animated.gif?size=600";
 * ```
 *
 * @see {@link Cdn.userBanner} - For programmatic user banner URL generation
 * @see {@link GuildBannerUrl} - For server-wide guild banners
 *
 * @public
 */
export type UserBannerUrl =
  CdnUrl<`banners/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing a default user avatar URL for users without custom avatars.
 *
 * Default avatars are automatically assigned by Discord to users who haven't
 * uploaded custom profile pictures, ensuring all users have visual representation.
 *
 * @remarks
 * Default avatar system:
 * - Assignment: Automatically assigned based on user discriminator or ID
 * - Variations: 6 different colored default avatars in rotation
 * - Legacy users: Uses discriminator modulo 5 for avatar selection
 * - New username system: Uses user ID modulo 6 for avatar selection
 * - Format: Always PNG format, static images only
 *
 * @example
 * ```typescript
 * // Default avatar for legacy user (discriminator-based)
 * const legacyDefault: DefaultUserAvatarUrl = "https://cdn.discordapp.com/embed/avatars/3.png";
 *
 * // Default avatar for new username system (ID-based)
 * const newDefault: DefaultUserAvatarUrl = "https://cdn.discordapp.com/embed/avatars/1.png";
 * ```
 *
 * @see {@link Cdn.defaultUserAvatar} - For legacy discriminator-based defaults
 * @see {@link Cdn.defaultUserAvatarSystem} - For new ID-based defaults
 * @see {@link UserAvatarUrl} - For custom user avatars
 *
 * @public
 */
export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;

/**
 * Type representing a custom user avatar URL with comprehensive format support.
 *
 * User avatars are custom profile pictures uploaded by Discord users,
 * supporting both static and animated formats based on subscription level.
 *
 * @remarks
 * User avatar specifications:
 * - Static avatars: Available to all users, supports PNG/JPEG/WebP/GIF formats
 * - Animated avatars: Exclusive to Nitro subscribers, uses GIF format
 * - Hash detection: Animated avatars have hashes prefixed with "a_"
 * - Dimensions: Square aspect ratio, Discord processes to various sizes
 * - Fallback: Non-Nitro users see static version of animated avatars
 *
 * @example
 * ```typescript
 * // Standard static user avatar
 * const staticAvatar: UserAvatarUrl = "https://cdn.discordapp.com/avatars/123456789012345678/avatar_hash.png?size=1024";
 *
 * // Animated avatar for Nitro users
 * const animatedAvatar: UserAvatarUrl = "https://cdn.discordapp.com/avatars/123456789012345678/a_animated_hash.gif?size=128";
 *
 * // WebP format for optimized bandwidth
 * const webpAvatar: UserAvatarUrl = "https://cdn.discordapp.com/avatars/123456789012345678/avatar_hash.webp?size=512";
 * ```
 *
 * @see {@link Cdn.userAvatar} - For programmatic user avatar URL generation
 * @see {@link DefaultUserAvatarUrl} - For users without custom avatars
 * @see {@link GuildMemberAvatarUrl} - For server-specific member avatars
 *
 * @public
 */
export type UserAvatarUrl =
  CdnUrl<`avatars/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing a guild-specific member avatar URL.
 *
 * Guild member avatars allow users to have different profile pictures
 * within specific servers, overriding their global Discord avatar.
 *
 * @remarks
 * Guild member avatar behavior:
 * - Override: Takes precedence over global user avatar within the specific guild
 * - Scope: Only visible within the guild where it's set
 * - Animation: Supports animated avatars for Nitro users
 * - Fallback: Falls back to global user avatar if no guild-specific avatar exists
 * - Permission: Users can set per-guild avatars in servers they're members of
 *
 * @example
 * ```typescript
 * // Server-specific member avatar
 * const guildAvatar: GuildMemberAvatarUrl =
 *   "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/avatars/member_avatar_hash.png?size=256";
 *
 * // Animated guild member avatar
 * const animatedGuildAvatar: GuildMemberAvatarUrl =
 *   "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/avatars/a_animated_member.gif?size=128";
 * ```
 *
 * @see {@link Cdn.guildMemberAvatar} - For programmatic guild member avatar URL generation
 * @see {@link UserAvatarUrl} - For global user avatars
 * @see {@link GuildMemberBannerUrl} - For guild-specific member banners
 *
 * @public
 */
export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${Snowflake}/users/${Snowflake}/avatars/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing an avatar decoration URL for premium profile enhancements.
 *
 * Avatar decorations are decorative frames and effects that appear around
 * user avatars, providing additional visual customization options.
 *
 * @remarks
 * Avatar decoration features:
 * - Purpose: Decorative frames, borders, and effects around user avatars
 * - Availability: Premium feature for Nitro subscribers and special events
 * - Format: Static PNG images with transparency support
 * - Application: Overlaid on top of user avatars in UI
 * - Collection: Various themed sets available through Discord's store
 *
 * @example
 * ```typescript
 * // Seasonal avatar decoration
 * const decoration: AvatarDecorationUrl = "https://cdn.discordapp.com/avatar-decoration-presets/123456789012345678.png";
 *
 * // Premium subscriber decoration
 * const premiumDecoration: AvatarDecorationUrl = "https://cdn.discordapp.com/avatar-decoration-presets/premium_frame_id.png";
 * ```
 *
 * @see {@link Cdn.avatarDecoration} - For programmatic avatar decoration URL generation
 * @see {@link UserAvatarUrl} - For the base avatar that decorations overlay
 *
 * @public
 */
export type AvatarDecorationUrl =
  CdnUrl<`avatar-decoration-presets/${Snowflake}.png`>;

/**
 * Type representing an application icon URL for Discord app directory listings.
 *
 * Application icons represent Discord bots and applications in various
 * Discord interfaces including the app directory and integration settings.
 *
 * @remarks
 * Application icon usage:
 * - Visibility: Shown in Discord app directory, bot profiles, and integration lists
 * - Format: Static images only (PNG, JPEG, WebP supported)
 * - Dimensions: Square aspect ratio recommended, 512x512px optimal
 * - Branding: Primary visual identifier for Discord applications
 * - Requirements: Required for public bot verification and app directory listing
 *
 * @example
 * ```typescript
 * // Bot application icon
 * const botIcon: ApplicationIconUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/bot_icon_hash.png?size=256";
 *
 * // High-resolution app directory icon
 * const appIcon: ApplicationIconUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/app_icon_hash.png?size=512";
 * ```
 *
 * @see {@link Cdn.applicationIcon} - For programmatic application icon URL generation
 * @see {@link ApplicationCoverUrl} - For application cover images
 *
 * @public
 */
export type ApplicationIconUrl =
  CdnUrl<`app-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing an application cover image URL for app directory banners.
 *
 * Application cover images serve as banner visuals in Discord's app directory,
 * providing prominent visual presentation for featured applications.
 *
 * @remarks
 * Application cover specifications:
 * - Purpose: Banner image displayed in Discord app directory listings
 * - Dimensions: 1920x1080px recommended for optimal display
 * - Format: Static images only (PNG, JPEG, WebP supported)
 * - Usage: Featured prominently in app discovery and detail pages
 * - Marketing: Key visual element for application promotion and branding
 *
 * @example
 * ```typescript
 * // App directory cover banner
 * const appCover: ApplicationCoverUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/cover_banner_hash.png?size=1024";
 *
 * // Optimized cover for mobile display
 * const mobileCover: ApplicationCoverUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/cover_banner_hash.webp?size=512";
 * ```
 *
 * @see {@link Cdn.applicationCover} - For programmatic application cover URL generation
 * @see {@link ApplicationIconUrl} - For application profile icons
 *
 * @public
 */
export type ApplicationCoverUrl =
  CdnUrl<`app-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a custom application asset URL for rich presence and integrations.
 *
 * Application assets are custom images uploaded by developers for use in
 * rich presence, slash command responses, and application integrations.
 *
 * @remarks
 * Application asset capabilities:
 * - Rich Presence: Large and small images displayed in user status
 * - Integration UI: Custom images in slash command responses and embeds
 * - Branding: Consistent visual elements across application features
 * - Management: Uploaded and managed through Discord Developer Portal
 * - Flexibility: Multiple assets per application for different contexts
 *
 * @example
 * ```typescript
 * // Rich presence large image
 * const gameAsset: ApplicationAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/game_logo_asset.png?size=512";
 *
 * // Rich presence small image (status indicator)
 * const statusAsset: ApplicationAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/status_indicator.png?size=128";
 * ```
 *
 * @see {@link Cdn.applicationAsset} - For programmatic application asset URL generation
 * @see {@link AchievementIconUrl} - For achievement-specific assets
 *
 * @public
 */
export type ApplicationAssetUrl =
  CdnUrl<`app-assets/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing an achievement icon URL for Discord's gaming achievements system.
 *
 * Achievement icons visually represent gaming accomplishments and milestones
 * within Discord's integrated achievements and gaming features.
 *
 * @remarks
 * Achievement icon system:
 * - Purpose: Visual representation of gaming achievements and milestones
 * - Integration: Part of Discord's gaming and rich presence ecosystem
 * - Format: Static images optimized for achievement display contexts
 * - Dimensions: Square format, typically displayed at 64x64 or 128x128px
 * - Context: Shown in user profiles, achievement listings, and notifications
 *
 * @example
 * ```typescript
 * // Gaming achievement icon
 * const achievementIcon: AchievementIconUrl =
 *   "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/987654321098765432/icons/achievement_hash.png?size=128";
 *
 * // Milestone achievement for profile display
 * const milestoneIcon: AchievementIconUrl =
 *   "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/555666777888999000/icons/milestone_hash.png?size=64";
 * ```
 *
 * @see {@link Cdn.achievementIcon} - For programmatic achievement icon URL generation
 * @see {@link ApplicationAssetUrl} - For general application assets
 *
 * @public
 */
export type AchievementIconUrl =
  CdnUrl<`app-assets/${Snowflake}/achievements/${Snowflake}/icons/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a store page asset URL for Discord's application marketplace.
 *
 * Store page assets are promotional images and media used in Discord's
 * application store listings and marketplace presentations.
 *
 * @remarks
 * Store page asset usage:
 * - Marketplace: Visual content for Discord's application store listings
 * - Promotion: Screenshots, banners, and promotional imagery
 * - Discovery: Helps users discover and evaluate applications
 * - Marketing: Professional presentation of application features and capabilities
 * - Variety: Multiple image types including screenshots, feature highlights, banners
 *
 * @example
 * ```typescript
 * // Application screenshot for store listing
 * const screenshot: StorePageAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/store/screenshot_01.png?size=1024";
 *
 * // Feature highlight banner
 * const featureBanner: StorePageAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/store/feature_banner.png?size=512";
 * ```
 *
 * @see {@link Cdn.storePageAsset} - For programmatic store page asset URL generation
 * @see {@link ApplicationCoverUrl} - For application cover images
 *
 * @public
 */
export type StorePageAssetUrl =
  CdnUrl<`app-assets/${Snowflake}/store/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a sticker pack banner URL for Discord's sticker marketplace.
 *
 * Sticker pack banners provide visual representation for collections of
 * stickers available in Discord's sticker shop and marketplace.
 *
 * @remarks
 * Sticker pack banner specifications:
 * - Purpose: Visual branding for sticker collections in Discord's marketplace
 * - Application ID: Uses Discord's official sticker application ID (710982414301790216)
 * - Format: Static images optimized for sticker shop display
 * - Usage: Displayed in sticker shop, pack browsing, and promotional contexts
 * - Consistency: Standardized format across all official sticker packs
 *
 * @example
 * ```typescript
 * // Official Discord sticker pack banner
 * const stickerPack: StickerPackBannerUrl =
 *   "https://cdn.discordapp.com/app-assets/710982414301790216/store/pack_banner_hash.png?size=512";
 *
 * // Seasonal sticker collection banner
 * const seasonalPack: StickerPackBannerUrl =
 *   "https://cdn.discordapp.com/app-assets/710982414301790216/store/seasonal_collection.png?size=256";
 * ```
 *
 * @see {@link Cdn.stickerPackBanner} - For programmatic sticker pack banner URL generation
 * @see {@link StickerUrl} - For individual sticker assets
 *
 * @public
 */
export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a team icon URL for Discord developer teams.
 *
 * Team icons provide visual identification for development teams in
 * Discord's developer portal and team management interfaces.
 *
 * @remarks
 * Team icon functionality:
 * - Purpose: Visual identifier for development teams in Discord Developer Portal
 * - Management: Used in team settings, member management, and application ownership
 * - Format: Static images only (PNG, JPEG, WebP supported)
 * - Dimensions: Square aspect ratio recommended for consistent display
 * - Scope: Visible to team members and in developer-facing interfaces
 *
 * @example
 * ```typescript
 * // Development team icon
 * const teamIcon: TeamIconUrl = "https://cdn.discordapp.com/team-icons/123456789012345678/team_logo_hash.png?size=256";
 *
 * // Organization team branding
 * const orgTeamIcon: TeamIconUrl = "https://cdn.discordapp.com/team-icons/123456789012345678/org_branding.png?size=128";
 * ```
 *
 * @see {@link Cdn.teamIcon} - For programmatic team icon URL generation
 * @see {@link ApplicationIconUrl} - For application-specific icons
 *
 * @public
 */
export type TeamIconUrl =
  CdnUrl<`team-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a Discord sticker URL with comprehensive format support.
 *
 * Stickers are expressive visual elements that support static images,
 * animated GIFs, and Lottie animations for rich communication experiences.
 *
 * @remarks
 * Discord sticker specifications:
 * - Static stickers: PNG format, used for simple image-based expressions
 * - Animated stickers: GIF format, provides motion and dynamic expressions
 * - Lottie stickers: JSON format, vector-based animations with small file sizes
 * - Media proxy: Animated GIF stickers may use media proxy for performance optimization
 * - File size: Optimized for fast loading and minimal bandwidth usage
 *
 * @example
 * ```typescript
 * // Static PNG sticker
 * const staticSticker: StickerUrl = "https://cdn.discordapp.com/stickers/123456789012345678.png?size=320";
 *
 * // Animated GIF sticker (via media proxy)
 * const animatedSticker: StickerUrl = "https://media.discordapp.net/stickers/987654321098765432.gif?size=320";
 *
 * // Lottie animation sticker
 * const lottieSticker: StickerUrl = "https://cdn.discordapp.com/stickers/555666777888999000.json";
 * ```
 *
 * @see {@link Cdn.sticker} - For programmatic sticker URL generation
 * @see {@link StickerFormat} - For supported sticker formats
 * @see {@link StickerPackBannerUrl} - For sticker pack banners
 *
 * @public
 */
export type StickerUrl =
  AnyCdnUrl<`stickers/${Snowflake}.${StickerFormat}${string}`>;

/**
 * Type representing a role icon URL for Discord server role customization.
 *
 * Role icons provide visual identification for server roles, appearing
 * next to role names in member lists and role management interfaces.
 *
 * @remarks
 * Role icon features:
 * - Purpose: Visual identification for server roles in member lists and UI
 * - Availability: Feature available to boosted servers (boost level requirement varies)
 * - Format: Static images only (PNG, JPEG, WebP supported)
 * - Dimensions: Small square format, typically displayed at 16x16 to 64x64px
 * - Integration: Appears throughout Discord UI wherever roles are displayed
 *
 * @example
 * ```typescript
 * // Moderator role icon
 * const modIcon: RoleIconUrl = "https://cdn.discordapp.com/role-icons/123456789012345678/moderator_badge.png?size=64";
 *
 * // VIP member role icon
 * const vipIcon: RoleIconUrl = "https://cdn.discordapp.com/role-icons/123456789012345678/vip_crown.png?size=32";
 * ```
 *
 * @see {@link Cdn.roleIcon} - For programmatic role icon URL generation
 * @see {@link GuildIconUrl} - For server-wide guild icons
 *
 * @public
 */
export type RoleIconUrl =
  CdnUrl<`role-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a guild scheduled event cover URL for event promotion.
 *
 * Event cover images provide visual representation for Discord server
 * events, enhancing event discovery and engagement.
 *
 * @remarks
 * Scheduled event cover specifications:
 * - Purpose: Visual banner for guild scheduled events
 * - Display: Shown in event listings, details, and promotional contexts
 * - Format: Static images only (PNG, JPEG, WebP supported)
 * - Dimensions: Landscape aspect ratio recommended for event cards
 * - Engagement: Increases event visibility and member interest
 *
 * @example
 * ```typescript
 * // Gaming tournament event cover
 * const tournamentCover: GuildScheduledEventCoverUrl =
 *   "https://cdn.discordapp.com/guild-events/123456789012345678/tournament_banner.png?size=512";
 *
 * // Community meetup event cover
 * const meetupCover: GuildScheduledEventCoverUrl =
 *   "https://cdn.discordapp.com/guild-events/123456789012345678/meetup_cover.png?size=1024";
 * ```
 *
 * @see {@link Cdn.guildScheduledEventCover} - For programmatic event cover URL generation
 * @see {@link GuildBannerUrl} - For general guild banners
 *
 * @public
 */
export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Type representing a guild-specific member banner URL for enhanced profiles.
 *
 * Guild member banners allow users to customize their profile appearance
 * within specific servers, providing server-specific visual identity.
 *
 * @remarks
 * Guild member banner behavior:
 * - Scope: Server-specific profile customization, overrides global banner within guild
 * - Animation: Supports both static and animated formats for eligible users
 * - Visibility: Only visible within the specific guild where it's set
 * - Fallback: Falls back to global user banner if no guild-specific banner exists
 * - Personalization: Allows context-specific profile presentation
 *
 * @example
 * ```typescript
 * // Guild-specific member profile banner
 * const guildBanner: GuildMemberBannerUrl =
 *   "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/banners/guild_banner_hash.png?size=512";
 *
 * // Animated guild member banner
 * const animatedGuildBanner: GuildMemberBannerUrl =
 *   "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/banners/a_animated_guild.gif?size=600";
 * ```
 *
 * @see {@link Cdn.guildMemberBanner} - For programmatic guild member banner URL generation
 * @see {@link UserBannerUrl} - For global user profile banners
 * @see {@link GuildMemberAvatarUrl} - For guild-specific member avatars
 *
 * @public
 */
export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${Snowflake}/users/${Snowflake}/banners/${string}.${AnimatedFormat}${string}`>;

/**
 * Type representing a message attachment URL for file sharing and media.
 *
 * Attachment URLs provide access to files uploaded to Discord messages,
 * including images, documents, audio, and other media content.
 *
 * @remarks
 * Attachment URL structure and behavior:
 * - Path: `attachments/{channel_id}/{attachment_id}/{filename}`
 * - Filename: Preserves original filename with proper URL encoding
 * - Persistence: URLs remain valid as long as the message exists
 * - File types: Supports wide variety of file formats and media types
 * - Size processing: Images support size parameter for automatic resizing
 *
 * @example
 * ```typescript
 * // Image attachment with resizing
 * const imageAttachment: AttachmentUrl =
 *   "https://cdn.discordapp.com/attachments/123456789012345678/987654321098765432/screenshot.png?size=1024";
 *
 * // Document attachment preserving filename
 * const documentAttachment: AttachmentUrl =
 *   "https://cdn.discordapp.com/attachments/123456789012345678/987654321098765432/important_document.pdf";
 *
 * // Audio file attachment
 * const audioAttachment: AttachmentUrl =
 *   "https://cdn.discordapp.com/attachments/123456789012345678/987654321098765432/voice_message.mp3";
 * ```
 *
 * @see {@link Cdn.attachment} - For programmatic attachment URL generation
 *
 * @public
 */
export type AttachmentUrl =
  CdnUrl<`attachments/${Snowflake}/${Snowflake}/${string}`>;

/**
 * Regular expression pattern for detecting animated Discord asset hashes.
 *
 * Discord uses a consistent naming convention where animated assets
 * have hashes prefixed with "a_" to indicate animation capability.
 *
 * @remarks
 * Animated hash detection:
 * - Pattern: Hashes starting with "a_" indicate animated assets
 * - Usage: Determines appropriate format (GIF vs PNG) for asset requests
 * - Consistency: Applied across all Discord asset types that support animation
 * - Fallback: Non-animated versions available for clients that don't support animation
 *
 * @example
 * ```typescript
 * const animatedHash = "a_1234567890abcdef1234567890abcdef";
 * const staticHash = "1234567890abcdef1234567890abcdef";
 *
 * console.log(ANIMATED_HASH.test(animatedHash)); // true
 * console.log(ANIMATED_HASH.test(staticHash));   // false
 *
 * // Usage in format detection
 * const format = ANIMATED_HASH.test(hash) ? "gif" : "png";
 * ```
 *
 * @see {@link Cdn.getFormatFromHash} - For automatic format detection using this pattern
 *
 * @public
 */
export const ANIMATED_HASH = /^a_/;

/**
 * Zod schema for validating Discord CDN image size parameters.
 *
 * Ensures that only Discord's supported power-of-2 size values are accepted,
 * providing compile-time and runtime type safety for image size requests.
 *
 * @remarks
 * Discord CDN size specifications:
 * - Supported sizes: 16, 32, 64, 128, 256, 512, 1024, 2048, 4096 pixels
 * - Format: Square dimensions (width = height)
 * - Performance: Larger sizes require more bandwidth and processing time
 * - Caching: Discord CDN caches images at supported sizes for optimal performance
 *
 * @example
 * ```typescript
 * // Valid sizes
 * const smallSize = ImageSize.parse(64);   // ✓ Valid
 * const largeSize = ImageSize.parse(2048); // ✓ Valid
 *
 * // Invalid sizes (will throw validation error)
 * const invalidSize = ImageSize.parse(100); // ✗ Not a power of 2
 * const tooLarge = ImageSize.parse(8192);   // ✗ Exceeds maximum
 * ```
 *
 * @see {@link ImageSize} - For the TypeScript type definition
 *
 * @public
 */
export const ImageSize = z.union([
  z.literal(16),
  z.literal(32),
  z.literal(64),
  z.literal(128),
  z.literal(256),
  z.literal(512),
  z.literal(1024),
  z.literal(2048),
  z.literal(4096),
]);

/**
 * Type definition for valid Discord CDN image sizes.
 *
 * Represents the union of all supported image dimensions for Discord CDN assets,
 * ensuring type safety when specifying image sizes in API calls and URL generation.
 *
 * @remarks
 * Size selection guidelines:
 * - 16-64px: Small UI elements, role icons, emoji
 * - 128-256px: Standard avatars, moderate detail requirements
 * - 512-1024px: High-quality avatars, banners, detailed images
 * - 2048-4096px: Maximum quality, large displays, print-quality needs
 *
 * @example
 * ```typescript
 * function generateAvatar(size: ImageSize) {
 *   // Type-safe size parameter
 *   return `avatar.png?size=${size}`;
 * }
 *
 * generateAvatar(256);  // ✓ Valid
 * generateAvatar(300);  // ✗ TypeScript error
 * ```
 *
 * @see {@link ImageSize} - For the Zod validation schema
 *
 * @public
 */
export type ImageSize = z.infer<typeof ImageSize>;

/**
 * Zod schema for validating Discord asset hash formats.
 *
 * Ensures asset hashes conform to Discord's expected format patterns,
 * supporting both static and animated asset hash validation.
 *
 * @remarks
 * Discord asset hash specifications:
 * - Static hashes: Hexadecimal characters (0-9, a-f, A-F) with optional underscores
 * - Animated hashes: Same format but prefixed with "a_"
 * - Length: Typically 32 characters for MD5-based hashes
 * - Case: Discord accepts both uppercase and lowercase hexadecimal
 *
 * @example
 * ```typescript
 * // Valid hash formats
 * const staticHash = AssetHash.parse("1234567890abcdef1234567890abcdef");
 * const animatedHash = AssetHash.parse("a_1234567890abcdef1234567890abcdef");
 *
 * // Invalid hash (will throw validation error)
 * const invalidHash = AssetHash.parse("invalid-hash-format");
 * ```
 *
 * @see {@link ANIMATED_HASH} - For animated hash detection
 *
 * @public
 */
export const AssetHash = z
  .string()
  .refine(
    (hash) => /^[a-fA-F0-9_]+$/.test(hash) || /^a_[a-fA-F0-9_]+$/.test(hash),
    {
      message: "Invalid Discord asset hash format",
    },
  );

/**
 * Zod schema and type for all supported Discord asset formats.
 *
 * Defines the complete set of file formats supported by Discord's CDN
 * for various asset types and use cases.
 *
 * @remarks
 * Format selection guidelines:
 * - PNG: Universal support, lossless compression, transparency support
 * - JPEG: Smaller file sizes for photographic content, no transparency
 * - WebP: Modern format with excellent compression, good browser support
 * - GIF: Animation support, larger file sizes, limited color palette
 * - JSON: Lottie animation format for vector-based animations
 *
 * @example
 * ```typescript
 * function getOptimalFormat(needsTransparency: boolean, isAnimated: boolean): AssetFormat {
 *   if (isAnimated) return "gif";
 *   if (needsTransparency) return "png";
 *   return "webp"; // Best compression for photos
 * }
 * ```
 *
 * @public
 */
export const AssetFormat = z.enum(["png", "jpeg", "webp", "gif", "json"]);
export type AssetFormat = z.infer<typeof AssetFormat>;

/**
 * Zod schema and type for non-animated (raster) image formats.
 *
 * Represents static image formats supported by Discord CDN,
 * excluding animation-capable formats like GIF and vector formats like JSON.
 *
 * @remarks
 * Raster format use cases:
 * - PNG: Icons, logos, images requiring transparency
 * - JPEG: Photographs, complex images without transparency needs
 * - WebP: Modern web images, excellent compression with quality retention
 *
 * @example
 * ```typescript
 * function generateStaticAsset(format: RasterFormat) {
 *   // Guaranteed to be non-animated format
 *   return `asset.${format}`;
 * }
 * ```
 *
 * @see {@link AssetFormat} - For all supported formats including animated
 * @see {@link AnimatedFormat} - For formats that support animation
 *
 * @public
 */
export const RasterFormat = AssetFormat.exclude(["gif", "json"]);
export type RasterFormat = z.infer<typeof RasterFormat>;

/**
 * Zod schema and type for potentially animated image formats.
 *
 * Represents image formats that support visual content, excluding
 * vector animation formats like JSON (Lottie).
 *
 * @remarks
 * Animated format capabilities:
 * - PNG: Static images with transparency
 * - JPEG: Static photographic images
 * - WebP: Static or animated with excellent compression
 * - GIF: Classic animation format with broad compatibility
 *
 * @example
 * ```typescript
 * function generateImageAsset(isAnimated: boolean): AnimatedFormat {
 *   return isAnimated ? "gif" : "png";
 * }
 * ```
 *
 * @see {@link AssetFormat} - For all supported formats including JSON
 * @see {@link RasterFormat} - For static image formats only
 *
 * @public
 */
export const AnimatedFormat = AssetFormat.exclude(["json"]);
export type AnimatedFormat = z.infer<typeof AnimatedFormat>;

/**
 * Zod schema and type for Discord sticker-specific formats.
 *
 * Represents the specialized format options available for Discord stickers,
 * including static images, animations, and vector-based Lottie animations.
 *
 * @remarks
 * Sticker format specifications:
 * - PNG: Static sticker images, universal compatibility
 * - GIF: Animated stickers with broad device support
 * - JSON: Lottie vector animations, small file sizes, scalable
 *
 * Note: JPEG and WebP are excluded from sticker formats due to Discord's
 * specific requirements for sticker image handling and transparency support.
 *
 * @example
 * ```typescript
 * function createStickerUrl(id: string, format: StickerFormat) {
 *   return `stickers/${id}.${format}`;
 * }
 *
 * // Static sticker
 * createStickerUrl("123", "png");  // ✓
 * // Animated sticker
 * createStickerUrl("456", "gif");  // ✓
 * // Vector animation
 * createStickerUrl("789", "json"); // ✓
 * ```
 *
 * @see {@link StickerUrl} - For sticker URL type definition
 * @see {@link AssetFormat} - For complete format enumeration
 *
 * @public
 */
export const StickerFormat = AssetFormat.exclude(["jpeg", "webp"]);
export type StickerFormat = z.infer<typeof StickerFormat>;

/**
 * Base Zod schema for common CDN image request options.
 *
 * Provides foundational configuration options that apply to all types
 * of Discord CDN image requests, ensuring consistent parameter validation.
 *
 * @remarks
 * Base options include:
 * - Size parameter: Controls output image dimensions
 * - Validation: Ensures size values match Discord's supported dimensions
 * - Optionality: Size parameter is optional, defaults to original dimensions
 *
 * @example
 * ```typescript
 * const baseOptions = BaseImageOptions.parse({ size: 512 });
 * // Result: { size: 512 }
 *
 * const noSizeOptions = BaseImageOptions.parse({});
 * // Result: {} (size is optional)
 * ```
 *
 * @see {@link BaseImageOptions} - For the TypeScript type definition
 * @see {@link ImageOptions} - For extended static image options
 * @see {@link AnimatedImageOptions} - For extended animated image options
 *
 * @public
 */
export const BaseImageOptions = z.object({
  /**
   * Optional image size in pixels for automatic resizing.
   *
   * When specified, Discord CDN will resize the image to the requested
   * dimensions while maintaining aspect ratio and optimizing for quality.
   *
   * @remarks
   * Size behavior:
   * - Square output: Both width and height set to specified size
   * - Quality preservation: Discord uses high-quality resizing algorithms
   * - Caching: Resized images are cached for improved performance
   * - Bandwidth: Smaller sizes reduce bandwidth usage and load times
   *
   * @example
   * ```typescript
   * // High-resolution for detailed viewing
   * { size: 1024 }
   *
   * // Optimized for list views
   * { size: 128 }
   *
   * // Original size (no resizing)
   * {} // size omitted
   * ```
   */
  size: ImageSize.optional(),
});

/**
 * Type definition for base CDN image request options.
 *
 * Provides a foundation for all CDN image option types, containing
 * common parameters that apply across different asset types.
 *
 * @example
 * ```typescript
 * function processImage(options: BaseImageOptions) {
 *   const queryParams = new URLSearchParams();
 *   if (options.size) {
 *     queryParams.set('size', options.size.toString());
 *   }
 *   return queryParams.toString();
 * }
 * ```
 *
 * @see {@link BaseImageOptions} - For the Zod validation schema
 *
 * @public
 */
export type BaseImageOptions = z.infer<typeof BaseImageOptions>;

/**
 * Zod schema for static image request options with format specification.
 *
 * Extends base options with format selection for static image assets
 * that don't support animation, providing precise control over output format.
 *
 * @remarks
 * Static image format selection:
 * - PNG: Default format, universal compatibility, transparency support
 * - JPEG: Smaller files for photographic content, no transparency
 * - WebP: Modern format with superior compression and quality
 *
 * @example
 * ```typescript
 * // High-quality PNG with specific size
 * const pngOptions = ImageOptions.parse({ format: "png", size: 512 });
 *
 * // Compressed WebP for bandwidth optimization
 * const webpOptions = ImageOptions.parse({ format: "webp", size: 256 });
 *
 * // Default PNG format
 * const defaultOptions = ImageOptions.parse({ size: 128 });
 * ```
 *
 * @see {@link ImageOptions} - For the TypeScript type definition
 * @see {@link AnimatedImageOptions} - For animated image options
 *
 * @public
 */
export const ImageOptions = BaseImageOptions.extend({
  /**
   * Static image format specification with intelligent defaulting.
   *
   * Determines the output format for static image assets, balancing
   * compatibility, quality, and file size considerations.
   *
   * @default "png"
   *
   * @remarks
   * Format selection guidelines:
   * - PNG: Best for images with transparency, sharp edges, or text
   * - JPEG: Optimal for photographic content without transparency
   * - WebP: Superior compression for modern browsers and applications
   *
   * @example
   * ```typescript
   * // Explicit format selection
   * { format: "webp", size: 512 }
   *
   * // Default PNG format
   * { size: 256 } // format defaults to "png"
   * ```
   */
  format: RasterFormat.default("png"),
});

/**
 * Type definition for static image request options.
 *
 * Used for configuring requests to static image assets like guild splashes,
 * application icons, and other non-animated visual content.
 *
 * @example
 * ```typescript
 * function getGuildIcon(guildId: string, hash: string, options: ImageOptions = {}) {
 *   const { format = "png", size } = options;
 *   return buildImageUrl(`icons/${guildId}/${hash}.${format}`, size);
 * }
 * ```
 *
 * @see {@link ImageOptions} - For the Zod validation schema
 *
 * @public
 */
export type ImageOptions = z.infer<typeof ImageOptions>;

/**
 * Zod schema for potentially animated image request options.
 *
 * Provides comprehensive configuration for assets that may support animation,
 * with intelligent format detection and explicit animation control.
 *
 * @remarks
 * Animated image handling:
 * - Format detection: Automatically determines format based on asset hash
 * - Animation override: Explicit control over animation vs static rendering
 * - Fallback behavior: Graceful degradation for non-animated assets
 *
 * @example
 * ```typescript
 * // Automatic format detection
 * const autoOptions = AnimatedImageOptions.parse({ size: 256 });
 *
 * // Force GIF format for animation
 * const animatedOptions = AnimatedImageOptions.parse({
 *   animated: true,
 *   size: 128
 * });
 *
 * // Explicit PNG format override
 * const staticOptions = AnimatedImageOptions.parse({
 *   format: "png",
 *   size: 512
 * });
 * ```
 *
 * @see {@link AnimatedImageOptions} - For the TypeScript type definition
 * @see {@link ImageOptions} - For static image options
 *
 * @public
 */
export const AnimatedImageOptions = BaseImageOptions.extend({
  /**
   * Optional format specification for animated image assets.
   *
   * When omitted, format is automatically determined based on asset
   * properties and animation capabilities.
   *
   * @remarks
   * Format determination logic:
   * 1. If format is explicitly specified, use that format
   * 2. If asset hash indicates animation (a_ prefix), default to GIF
   * 3. If animated option is true, prefer GIF format
   * 4. Otherwise, default to PNG for maximum compatibility
   *
   * @example
   * ```typescript
   * // Explicit format (overrides auto-detection)
   * { format: "webp" }
   *
   * // Auto-detection based on hash and animated flag
   * { animated: true } // Will prefer GIF
   *
   * // Complete auto-detection
   * {} // Format determined by asset properties
   * ```
   */
  format: AnimatedFormat.optional(),

  /**
   * Explicit animation preference override.
   *
   * Forces animated rendering even when automatic detection might
   * choose static format, providing precise control over animation behavior.
   *
   * @remarks
   * Animation override behavior:
   * - true: Forces GIF format for animated rendering
   * - false: Prefers static format regardless of asset capabilities
   * - undefined: Uses automatic detection based on asset hash
   *
   * @example
   * ```typescript
   * // Force animated GIF
   * { animated: true }
   *
   * // Force static PNG
   * { animated: false, format: "png" }
   *
   * // Auto-detect based on asset hash
   * { } // animated: undefined
   * ```
   */
  animated: z.boolean().optional(),
});

/**
 * Type definition for potentially animated image request options.
 *
 * Used for configuring requests to assets that may support animation,
 * such as user avatars, guild icons, and banners.
 *
 * @example
 * ```typescript
 * function getUserAvatar(userId: string, hash: string, options: AnimatedImageOptions = {}) {
 *   const format = determineFormat(hash, options);
 *   return buildImageUrl(`avatars/${userId}/${hash}.${format}`, options.size);
 * }
 * ```
 *
 * @see {@link AnimatedImageOptions} - For the Zod validation schema
 *
 * @public
 */
export type AnimatedImageOptions = z.infer<typeof AnimatedImageOptions>;

/**
 * Zod schema for Discord sticker-specific request options.
 *
 * Provides specialized configuration for sticker assets, including
 * format selection and media proxy optimization preferences.
 *
 * @remarks
 * Sticker-specific considerations:
 * - Media proxy: GIF stickers can use media proxy for better performance
 * - Format variety: Supports PNG, GIF, and JSON (Lottie) formats
 * - Default format: PNG provides universal compatibility
 *
 * @example
 * ```typescript
 * // Default PNG sticker
 * const staticSticker = StickerFormatOptions.parse({ size: 320 });
 *
 * // Animated GIF with media proxy
 * const animatedSticker = StickerFormatOptions.parse({
 *   format: "gif",
 *   size: 320,
 *   useMediaProxy: true
 * });
 *
 * // Lottie vector animation
 * const vectorSticker = StickerFormatOptions.parse({
 *   format: "json"
 * });
 * ```
 *
 * @see {@link StickerFormatOptions} - For the TypeScript type definition
 * @see {@link StickerUrl} - For sticker URL type definition
 *
 * @public
 */
export const StickerFormatOptions = BaseImageOptions.extend({
  /**
   * Sticker format specification with PNG default.
   *
   * Determines the output format for sticker assets, with PNG providing
   * the best balance of compatibility and quality for most use cases.
   *
   * @default "png"
   *
   * @remarks
   * Sticker format recommendations:
   * - PNG: Universal compatibility, transparency support, good quality
   * - GIF: Animation support, broader device compatibility
   * - JSON: Vector-based Lottie animations, scalable, smallest file size
   *
   * @example
   * ```typescript
   * // High-quality static sticker
   * { format: "png", size: 320 }
   *
   * // Animated sticker
   * { format: "gif", size: 160 }
   *
   * // Vector animation
   * { format: "json" } // Size not applicable to vector format
   * ```
   */
  format: StickerFormat.default("png"),

  /**
   * Media proxy optimization preference for GIF stickers.
   *
   * Controls whether animated GIF stickers should use Discord's media proxy
   * for enhanced performance and optimization.
   *
   * @default true
   *
   * @remarks
   * Media proxy benefits:
   * - Performance: Optimized delivery for animated content
   * - Bandwidth: Better compression and streaming for GIF assets
   * - Compatibility: Enhanced support across different client platforms
   * - Caching: Improved caching strategies for animated content
   *
   * @example
   * ```typescript
   * // Use media proxy for better GIF performance
   * { format: "gif", useMediaProxy: true }
   *
   * // Direct CDN delivery
   * { format: "gif", useMediaProxy: false }
   *
   * // Media proxy doesn't affect non-GIF formats
   * { format: "png", useMediaProxy: true } // useMediaProxy ignored
   * ```
   */
  useMediaProxy: z.boolean().default(true),
});

/**
 * Type definition for sticker-specific request options.
 *
 * Used for configuring requests to Discord sticker assets with
 * specialized handling for different sticker formats and delivery optimization.
 *
 * @example
 * ```typescript
 * function getStickerUrl(stickerId: string, options: StickerFormatOptions = {}) {
 *   const { format = "png", useMediaProxy = true } = options;
 *   const baseUrl = (format === "gif" && useMediaProxy)
 *     ? "https://media.discordapp.net"
 *     : "https://cdn.discordapp.com";
 *
 *   return `${baseUrl}/stickers/${stickerId}.${format}`;
 * }
 * ```
 *
 * @see {@link StickerFormatOptions} - For the Zod validation schema
 *
 * @public
 */
export type StickerFormatOptions = z.infer<typeof StickerFormatOptions>;

/**
 * Internal utility function for consistent Zod schema validation with enhanced error reporting.
 *
 * Provides a centralized validation mechanism that converts Zod validation errors
 * into user-friendly error messages for better developer experience.
 *
 * @template T - The Zod schema type being validated
 * @param schema - The Zod schema to validate against
 * @param input - The input data to validate
 * @returns The validated and parsed input with proper typing
 * @throws {Error} User-friendly error message if validation fails
 *
 * @internal
 */
function validateWithZod<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.data;
}

/**
 * Comprehensive utility object for generating Discord CDN resource URLs.
 *
 * Provides a complete toolkit for constructing properly formatted URLs for all
 * Discord asset types, with intelligent format detection, validation, and
 * optimization features.
 *
 * @remarks
 * Key capabilities:
 * - **Type Safety**: Full TypeScript integration with compile-time URL validation
 * - **Format Intelligence**: Automatic format detection based on asset properties
 * - **Performance Optimization**: Smart CDN endpoint selection and caching strategies
 * - **Validation**: Comprehensive input validation with user-friendly error messages
 * - **Flexibility**: Support for all Discord asset types and customization options
 *
 * @example
 * ```typescript
 * // Basic usage with type safety
 * const avatarUrl = Cdn.userAvatar("123456789", "avatar_hash", { size: 256 });
 *
 * // Animated asset with format detection
 * const guildIcon = Cdn.guildIcon("987654321", "a_animated_hash", { animated: true });
 *
 * // Custom configuration
 * const sticker = Cdn.sticker("555666777", {
 *   format: "gif",
 *   size: 320,
 *   useMediaProxy: true
 * });
 * ```
 *
 * @see {@link CdnUrl} - For primary CDN URL types
 * @see {@link MediaProxyUrl} - For media proxy URL types
 * @see {@link AnyCdnUrl} - For flexible CDN URL handling
 *
 * @public
 */
export const Cdn = {
  /**
   * Primary Discord CDN endpoint for static content delivery.
   *
   * The main content delivery network used by Discord for hosting and serving
   * the majority of static assets including avatars, icons, banners, and media.
   *
   * @remarks
   * CDN characteristics:
   * - Global distribution: Servers worldwide for low-latency access
   * - Caching: Aggressive caching strategies for optimal performance
   * - SSL/TLS: Secure HTTPS delivery for all content
   * - Compression: Automatic optimization and compression
   * - Reliability: High availability with redundancy and failover
   *
   * @example
   * ```typescript
   * // Used internally by all CDN utility functions
   * const fullUrl = `${Cdn.BASE_URL}avatars/123456789/hash.png`;
   * ```
   *
   * @public
   */
  BASE_URL: "https://cdn.discordapp.com/" as const,

  /**
   * Specialized media proxy endpoint for enhanced content processing.
   *
   * Discord's media proxy provides advanced processing capabilities for
   * animated content, large media files, and assets requiring transcoding.
   *
   * @remarks
   * Media proxy advantages:
   * - Animation optimization: Enhanced processing for GIF and animated content
   * - Transcoding: Format conversion and optimization capabilities
   * - Bandwidth management: Smart compression for mobile and limited bandwidth
   * - Performance: Specialized caching for media-heavy content
   * - Compatibility: Enhanced support across different client platforms
   *
   * @example
   * ```typescript
   * // Automatically used for GIF stickers when useMediaProxy is true
   * const animatedSticker = `${Cdn.MEDIA_PROXY_URL}stickers/123456789.gif`;
   * ```
   *
   * @see {@link MediaProxyUrl} - For media proxy URL type definitions
   *
   * @public
   */
  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const,

  /**
   * Intelligently determines the optimal format for an asset based on its hash and preferences.
   *
   * Analyzes asset characteristics and user preferences to select the most appropriate
   * format, balancing animation support, file size, and compatibility requirements.
   *
   * @param hash - Discord asset hash (may contain "a_" prefix for animated assets)
   * @param options - Image options including format preferences and animation flags
   * @returns The optimal format string for the asset
   *
   * @remarks
   * Format selection logic:
   * 1. **Explicit format**: If options.format is specified, use that format
   * 2. **Animation detection**: Check for "a_" hash prefix or options.animated flag
   * 3. **Animated preference**: Use GIF for animated assets, PNG for static
   * 4. **Fallback**: Default to PNG for maximum compatibility
   *
   * This method ensures optimal format selection while maintaining compatibility
   * across different Discord clients and devices.
   *
   * @example
   * ```typescript
   * // Animated asset detection
   * const animatedFormat = Cdn.getFormatFromHash("a_1234567890abcdef", {});
   * console.log(animatedFormat); // "gif"
   *
   * // Static asset
   * const staticFormat = Cdn.getFormatFromHash("1234567890abcdef", {});
   * console.log(staticFormat); // "png"
   *
   * // Explicit format override
   * const webpFormat = Cdn.getFormatFromHash("hash", { format: "webp" });
   * console.log(webpFormat); // "webp"
   *
   * // Force animation
   * const forcedGif = Cdn.getFormatFromHash("static_hash", { animated: true });
   * console.log(forcedGif); // "gif"
   * ```
   *
   * @see {@link ANIMATED_HASH} - For animated hash detection pattern
   * @see {@link AnimatedImageOptions} - For supported options
   *
   * @public
   */
  getFormatFromHash(
    hash: string,
    options: AnimatedImageOptions,
  ): AnimatedFormat {
    // Use explicitly specified format if provided
    if (options.format) {
      return options.format;
    }

    // Check if resource is animated (by hash prefix or forced option)
    const isAnimated = options.animated || ANIMATED_HASH.test(hash);
    return isAnimated ? "gif" : "png";
  },

  /**
   * Core URL construction utility that builds complete CDN URLs from components.
   *
   * Assembles URL components into properly formatted Discord CDN URLs with
   * optional size parameters and intelligent endpoint selection.
   *
   * @template T - The specific CDN URL type being constructed
   * @param path - The resource path within the CDN structure
   * @param size - Optional size parameter for image resizing
   * @param useMediaProxy - Whether to use media proxy endpoint instead of primary CDN
   * @returns Complete, properly formatted CDN URL
   *
   * @remarks
   * URL construction process:
   * 1. **Endpoint selection**: Choose between primary CDN and media proxy
   * 2. **Path assembly**: Combine base URL with provided resource path
   * 3. **Parameter addition**: Append size query parameter if specified
   * 4. **Validation**: Ensure proper URL formatting and encoding
   *
   * This method serves as the foundation for all other CDN URL generation
   * functions, providing consistent behavior and formatting across asset types.
   *
   * @example
   * ```typescript
   * // Basic URL construction
   * const avatarUrl = Cdn.buildUrl("avatars/123456789/hash.png", 256);
   * // Result: "https://cdn.discordapp.com/avatars/123456789/hash.png?size=256"
   *
   * // Media proxy usage
   * const stickerUrl = Cdn.buildUrl("stickers/987654321.gif", 320, true);
   * // Result: "https://media.discordapp.net/stickers/987654321.gif?size=320"
   *
   * // No size parameter
   * const iconUrl = Cdn.buildUrl("icons/555666777/icon.png");
   * // Result: "https://cdn.discordapp.com/icons/555666777/icon.png"
   * ```
   *
   * @see {@link BASE_URL} - For primary CDN endpoint
   * @see {@link MEDIA_PROXY_URL} - For media proxy endpoint
   *
   * @public
   */
  buildUrl<T extends AnyCdnUrl>(
    path: ExtractPath<T>,
    size?: ImageSize,
    useMediaProxy = false,
  ): T {
    const url = new URL(
      path,
      useMediaProxy ? this.MEDIA_PROXY_URL : this.BASE_URL,
    );

    if (size) {
      url.searchParams.set("size", size.toString());
    }

    return url.toString() as T;
  },

  /**
   * Generates optimized URLs for Discord custom emoji assets.
   *
   * Creates properly formatted URLs for emoji resources with intelligent format
   * selection and size optimization for various display contexts.
   *
   * @param emojiId - Discord emoji snowflake ID
   * @param options - Image formatting options including size and format preferences
   * @returns Complete URL to the emoji asset
   *
   * @throws {Error} Invalid emoji ID format or unsupported option values
   *
   * @remarks
   * Emoji URL characteristics:
   * - **Format flexibility**: Supports PNG, GIF, WebP formats
   * - **Size optimization**: Automatic resizing for different UI contexts
   * - **Animation support**: GIF format for animated emojis
   * - **Compatibility**: PNG default ensures universal client support
   *
   * @example
   * ```typescript
   * // Basic emoji URL with default PNG format
   * const basicEmoji = Cdn.emoji("123456789012345678");
   * // Result: "https://cdn.discordapp.com/emojis/123456789012345678.png"
   *
   * // High-resolution emoji for detailed display
   * const highResEmoji = Cdn.emoji("123456789012345678", { size: 256 });
   * // Result: "https://cdn.discordapp.com/emojis/123456789012345678.png?size=256"
   *
   * // WebP format for optimized bandwidth
   * const webpEmoji = Cdn.emoji("123456789012345678", {
   *   format: "webp",
   *   size: 128
   * });
   * // Result: "https://cdn.discordapp.com/emojis/123456789012345678.webp?size=128"
   *
   * // GIF format for potential animation
   * const animatedEmoji = Cdn.emoji("123456789012345678", {
   *   format: "gif",
   *   size: 64
   * });
   * // Result: "https://cdn.discordapp.com/emojis/123456789012345678.gif?size=64"
   * ```
   *
   * @see {@link EmojiUrl} - For emoji URL type definition
   * @see {@link AnimatedImageOptions} - For supported options
   *
   * @public
   */
  emoji(
    emojiId: Snowflake,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): EmojiUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = validatedOptions.format ?? "png"; // Emoji does not have hash
    return this.buildUrl(`emojis/${emojiId}.${format}`, validatedOptions.size);
  },

  /**
   * Generates URLs for Discord guild icon assets with comprehensive animation support.
   *
   * Creates properly formatted URLs for guild icons with intelligent format detection
   * based on asset hash patterns and user preferences.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild icon asset hash (may include "a_" prefix for animated icons)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the guild icon asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Guild icon features:
   * - **Animation detection**: Automatic GIF format for "a_" prefixed hashes
   * - **Quality scaling**: Supports all Discord CDN size options
   * - **Format flexibility**: PNG, GIF, WebP, JPEG support based on content type
   * - **Boost compatibility**: Higher quality available for boosted servers
   *
   * @example
   * ```typescript
   * // Static guild icon with default settings
   * const staticIcon = Cdn.guildIcon(
   *   "123456789012345678",
   *   "abcdef1234567890",
   *   { size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/icons/123456789012345678/abcdef1234567890.png?size=256"
   *
   * // Animated guild icon (detected by hash prefix)
   * const animatedIcon = Cdn.guildIcon(
   *   "123456789012345678",
   *   "a_animated1234567890"
   * );
   * // Result: "https://cdn.discordapp.com/icons/123456789012345678/a_animated1234567890.gif"
   *
   * // Force static format for animated hash
   * const forcedStatic = Cdn.guildIcon(
   *   "123456789012345678",
   *   "a_animated1234567890",
   *   { format: "png", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/icons/123456789012345678/a_animated1234567890.png?size=512"
   *
   * // WebP format for optimal compression
   * const webpIcon = Cdn.guildIcon(
   *   "123456789012345678",
   *   "icon_hash",
   *   { format: "webp", size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/icons/123456789012345678/icon_hash.webp?size=128"
   * ```
   *
   * @see {@link GuildIconUrl} - For guild icon URL type definition
   * @see {@link ANIMATED_HASH} - For animated hash detection
   * @see {@link AnimatedImageOptions} - For supported options
   *
   * @public
   */
  guildIcon(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildIconUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `icons/${guildId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild splash images used in invite backgrounds.
   *
   * Creates properly formatted URLs for guild splash assets that appear as
   * background images on Discord server invites and discovery listings.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild splash asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the guild splash asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Guild splash specifications:
   * - **Static only**: Splash images do not support animation
   * - **Aspect ratio**: Optimized for 16:9 landscape presentation
   * - **Boost requirement**: Available to guilds with boost level 1 or higher
   * - **Usage contexts**: Server invites, discovery listings, promotional content
   *
   * @example
   * ```typescript
   * // Standard guild splash for invites
   * const inviteSplash = Cdn.guildSplash(
   *   "123456789012345678",
   *   "splash_hash_12345",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/splashes/123456789012345678/splash_hash_12345.png?size=1024"
   *
   * // WebP format for bandwidth optimization
   * const optimizedSplash = Cdn.guildSplash(
   *   "123456789012345678",
   *   "splash_hash_12345",
   *   { format: "webp", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/splashes/123456789012345678/splash_hash_12345.webp?size=512"
   *
   * // JPEG format for photographic content
   * const photoSplash = Cdn.guildSplash(
   *   "123456789012345678",
   *   "photo_splash_hash",
   *   { format: "jpeg", size: 2048 }
   * );
   * // Result: "https://cdn.discordapp.com/splashes/123456789012345678/photo_splash_hash.jpeg?size=2048"
   * ```
   *
   * @see {@link GuildSplashUrl} - For guild splash URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.guildDiscoverySplash} - For discovery-specific splashes
   *
   * @public
   */
  guildSplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildSplashUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `splashes/${guildId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild discovery splash images for server discovery.
   *
   * Creates properly formatted URLs for discovery splash assets that appear
   * specifically in Discord's server discovery system and promotional contexts.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild discovery splash asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the guild discovery splash asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Discovery splash characteristics:
   * - **Discovery focus**: Optimized specifically for server discovery cards
   * - **Static format**: No animation support, focused on clear presentation
   * - **Eligibility**: Available to guilds eligible for Discord's discovery system
   * - **Distinction**: Separate from regular invite splash images
   *
   * @example
   * ```typescript
   * // Discovery splash optimized for discovery cards
   * const discoverySplash = Cdn.guildDiscoverySplash(
   *   "123456789012345678",
   *   "discovery_splash_hash",
   *   { size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/discovery-splashes/123456789012345678/discovery_splash_hash.png?size=512"
   *
   * // WebP format for mobile optimization
   * const mobileSplash = Cdn.guildDiscoverySplash(
   *   "123456789012345678",
   *   "mobile_optimized_hash",
   *   { format: "webp", size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/discovery-splashes/123456789012345678/mobile_optimized_hash.webp?size=256"
   * ```
   *
   * @see {@link GuildDiscoverySplashUrl} - For discovery splash URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.guildSplash} - For regular guild invite splashes
   *
   * @public
   */
  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildDiscoverySplashUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `discovery-splashes/${guildId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild banner images with animation support.
   *
   * Creates properly formatted URLs for guild banner assets that appear at the
   * top of Discord server channel lists, supporting both static and animated formats.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild banner asset hash (may include "a_" prefix for animated banners)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the guild banner asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Guild banner features:
   * - **Prominent placement**: Displayed at top of guild channel list
   * - **Animation support**: GIF format for animated banners (boost level 2+ required)
   * - **Aspect ratio**: 16:9 landscape format recommended (960x540px)
   * - **Visibility**: Shown to all guild members regardless of their boost status
   *
   * @example
   * ```typescript
   * // Static guild banner
   * const staticBanner = Cdn.guildBanner(
   *   "123456789012345678",
   *   "banner_hash_static",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/banner_hash_static.png?size=1024"
   *
   * // Animated guild banner (detected by hash prefix)
   * const animatedBanner = Cdn.guildBanner(
   *   "123456789012345678",
   *   "a_animated_banner_hash"
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/a_animated_banner_hash.gif"
   *
   * // Force static format for animated hash
   * const forcedStatic = Cdn.guildBanner(
   *   "123456789012345678",
   *   "a_animated_banner_hash",
   *   { format: "png", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/a_animated_banner_hash.png?size=512"
   * ```
   *
   * @see {@link GuildBannerUrl} - For guild banner URL type definition
   * @see {@link ANIMATED_HASH} - For animated hash detection
   * @see {@link AnimatedImageOptions} - For supported options
   *
   * @public
   */
  guildBanner(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildBannerUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `banners/${guildId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord user profile banner images with animation support.
   *
   * Creates properly formatted URLs for user banner assets that appear on
   * Discord user profiles, supporting both static and animated formats.
   *
   * @param userId - Discord user snowflake ID
   * @param hash - User banner asset hash (may include "a_" prefix for animated banners)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the user banner asset
   *
   * @throws {Error} Invalid user ID, malformed hash, or unsupported option values
   *
   * @remarks
   * User banner specifications:
   * - **Profile display**: Shown on user profile popups and full profile views
   * - **Animation availability**: Static for all users, animated for Nitro subscribers
   * - **Aspect ratio**: 5:2 recommended aspect ratio (600x240px optimal)
   * - **Personal expression**: Represents individual user identity and preferences
   *
   * @example
   * ```typescript
   * // Standard user profile banner
   * const userBanner = Cdn.userBanner(
   *   "123456789012345678",
   *   "user_banner_hash",
   *   { size: 600 }
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/user_banner_hash.png?size=600"
   *
   * // Animated banner for Nitro users (detected by hash)
   * const nitroBanner = Cdn.userBanner(
   *   "123456789012345678",
   *   "a_nitro_animated_hash"
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/a_nitro_animated_hash.gif"
   *
   * // WebP format for bandwidth optimization
   * const webpBanner = Cdn.userBanner(
   *   "123456789012345678",
   *   "banner_hash",
   *   { format: "webp", size: 300 }
   * );
   * // Result: "https://cdn.discordapp.com/banners/123456789012345678/banner_hash.webp?size=300"
   * ```
   *
   * @see {@link UserBannerUrl} - For user banner URL type definition
   * @see {@link ANIMATED_HASH} - For animated hash detection
   * @see {@link AnimatedImageOptions} - For supported options
   *
   * @public
   */
  userBanner(
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserBannerUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `banners/${userId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for default Discord user avatars assigned to users without custom avatars.
   *
   * Creates properly formatted URLs for default avatar assets based on legacy
   * discriminator values, providing fallback avatars for users who haven't uploaded custom ones.
   *
   * @param discriminator - User discriminator string or number (four digits after #)
   * @returns Complete URL to the appropriate default avatar asset
   *
   * @remarks
   * Legacy default avatar system:
   * - **Assignment method**: Uses discriminator modulo 5 for avatar selection
   * - **Avatar count**: 5 different colored default avatars in rotation
   * - **Format**: Always PNG format, static images only
   * - **Compatibility**: For users with legacy username system (discriminators)
   *
   * @example
   * ```typescript
   * // Default avatar for user with discriminator #0001
   * const avatar1 = Cdn.defaultUserAvatar("0001");
   * // Result: "https://cdn.discordapp.com/embed/avatars/1.png"
   *
   * // Default avatar for user with discriminator #0005
   * const avatar5 = Cdn.defaultUserAvatar("0005");
   * // Result: "https://cdn.discordapp.com/embed/avatars/0.png"
   *
   * // Using numeric discriminator
   * const avatarNum = Cdn.defaultUserAvatar(1234);
   * // Result: "https://cdn.discordapp.com/embed/avatars/4.png" (1234 % 5 = 4)
   * ```
   *
   * @see {@link DefaultUserAvatarUrl} - For default avatar URL type definition
   * @see {@link Cdn.defaultUserAvatarSystem} - For new username system defaults
   * @see {@link Cdn.userAvatar} - For custom user avatars
   *
   * @public
   */
  defaultUserAvatar(discriminator: string | number): DefaultUserAvatarUrl {
    const index =
      typeof discriminator === "string"
        ? Number(discriminator) % 5
        : discriminator % 5;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates URLs for default Discord user avatars for the new username system.
   *
   * Creates properly formatted URLs for default avatar assets based on user ID
   * calculation, supporting Discord's updated username system without discriminators.
   *
   * @param userId - Discord user snowflake ID
   * @returns Complete URL to the appropriate default avatar asset
   *
   * @remarks
   * New username system features:
   * - **Calculation method**: Uses (user_id >> 22) % 6 for avatar selection
   * - **Avatar count**: 6 different colored default avatars (expanded from 5)
   * - **Bit shifting**: Leverages timestamp portion of snowflake for distribution
   * - **Migration**: Gradually replacing discriminator-based system
   *
   * The bit shifting approach ensures even distribution across the 6 available
   * default avatars while being deterministic for each user ID.
   *
   * @example
   * ```typescript
   * // Default avatar for new username system user
   * const newSystemAvatar = Cdn.defaultUserAvatarSystem("123456789012345678");
   * // Calculates: (BigInt("123456789012345678") >> 22n) % 6n
   * // Result: "https://cdn.discordapp.com/embed/avatars/[0-5].png"
   *
   * // Different user ID will get different default avatar
   * const anotherAvatar = Cdn.defaultUserAvatarSystem("987654321098765432");
   * // Result: Different index based on ID calculation
   * ```
   *
   * @see {@link DefaultUserAvatarUrl} - For default avatar URL type definition
   * @see {@link Cdn.defaultUserAvatar} - For legacy discriminator-based defaults
   * @see {@link Cdn.userAvatar} - For custom user avatars
   *
   * @public
   */
  defaultUserAvatarSystem(userId: Snowflake): DefaultUserAvatarUrl {
    // Convert to BigInt, shift right 22 bits, mod 6
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates URLs for Discord user avatar images with comprehensive animation support.
   *
   * Creates properly formatted URLs for user avatar assets with intelligent format
   * detection and optimization for various display contexts and subscription levels.
   *
   * @param userId - Discord user snowflake ID
   * @param hash - User avatar asset hash (may include "a_" prefix for animated avatars)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the user avatar asset
   *
   * @throws {Error} Invalid user ID, malformed hash, or unsupported option values
   *
   * @remarks
   * User avatar capabilities:
   * - **Universal access**: Static avatars available to all Discord users
   * - **Nitro exclusive**: Animated avatars exclusive to Nitro subscribers
   * - **Format detection**: Automatic GIF format for "a_" prefixed hashes
   * - **Fallback behavior**: Non-Nitro users see static version of animated avatars
   * - **Quality scaling**: Supports all Discord CDN size options for optimal display
   *
   * @example
   * ```typescript
   * // Standard static user avatar
   * const staticAvatar = Cdn.userAvatar(
   *   "123456789012345678",
   *   "avatar_hash_12345",
   *   { size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/avatars/123456789012345678/avatar_hash_12345.png?size=256"
   *
   * // Animated avatar for Nitro users (detected by hash)
   * const animatedAvatar = Cdn.userAvatar(
   *   "123456789012345678",
   *   "a_animated_hash_67890"
   * );
   * // Result: "https://cdn.discordapp.com/avatars/123456789012345678/a_animated_hash_67890.gif"
   *
   * // WebP format for optimized bandwidth
   * const webpAvatar = Cdn.userAvatar(
   *   "123456789012345678",
   *   "avatar_hash",
   *   { format: "webp", size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/avatars/123456789012345678/avatar_hash.webp?size=128"
   *
   * // Force static format for animated hash
   * const forcedStatic = Cdn.userAvatar(
   *   "123456789012345678",
   *   "a_animated_hash",
   *   { format: "png", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/avatars/123456789012345678/a_animated_hash.png?size=512"
   * ```
   *
   * @see {@link UserAvatarUrl} - For user avatar URL type definition
   * @see {@link ANIMATED_HASH} - For animated hash detection
   * @see {@link AnimatedImageOptions} - For supported options
   * @see {@link Cdn.defaultUserAvatar} - For fallback default avatars
   *
   * @public
   */
  userAvatar(
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `avatars/${userId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for guild-specific member avatar images with animation support.
   *
   * Creates properly formatted URLs for guild member avatar assets that override
   * global user avatars within specific Discord servers.
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Guild member avatar asset hash (may include "a_" prefix for animated avatars)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the guild member avatar asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported option values
   *
   * @remarks
   * Guild member avatar features:
   * - **Server-specific**: Overrides global user avatar only within the specific guild
   * - **Context awareness**: Different avatar for different servers/communities
   * - **Animation support**: Supports animated avatars for eligible users
   * - **Fallback chain**: Falls back to global user avatar, then default avatar
   * - **Permission-based**: Users can set per-guild avatars where they're members
   *
   * @example
   * ```typescript
   * // Guild-specific member avatar
   * const guildAvatar = Cdn.guildMemberAvatar(
   *   "123456789012345678", // Guild ID
   *   "987654321098765432", // User ID
   *   "guild_avatar_hash",
   *   { size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/avatars/guild_avatar_hash.png?size=256"
   *
   * // Animated guild member avatar
   * const animatedGuildAvatar = Cdn.guildMemberAvatar(
   *   "123456789012345678",
   *   "987654321098765432",
   *   "a_animated_guild_hash"
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/avatars/a_animated_guild_hash.gif"
   *
   * // High-resolution guild avatar for moderation interface
   * const modAvatar = Cdn.guildMemberAvatar(
   *   "123456789012345678",
   *   "987654321098765432",
   *   "mod_avatar_hash",
   *   { size: 512, format: "webp" }
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/avatars/mod_avatar_hash.webp?size=512"
   * ```
   *
   * @see {@link GuildMemberAvatarUrl} - For guild member avatar URL type definition
   * @see {@link Cdn.userAvatar} - For global user avatars
   * @see {@link Cdn.guildMemberBanner} - For guild-specific member banners
   *
   * @public
   */
  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberAvatarUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/avatars/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for avatar decoration assets for premium profile enhancements.
   *
   * Creates properly formatted URLs for avatar decoration assets that provide
   * decorative frames and effects around user avatars.
   *
   * @param assetId - Avatar decoration asset snowflake ID
   * @returns Complete URL to the avatar decoration asset
   *
   * @remarks
   * Avatar decoration characteristics:
   * - **Premium feature**: Available through Nitro subscriptions and special events
   * - **Overlay system**: Designed to be overlaid on top of user avatars
   * - **Transparency support**: PNG format with alpha channel for proper layering
   * - **Themed collections**: Various seasonal and promotional decoration sets
   * - **Static format**: Currently only supports static PNG decorations
   *
   * @example
   * ```typescript
   * // Seasonal holiday decoration
   * const holidayDecoration = Cdn.avatarDecoration("123456789012345678");
   * // Result: "https://cdn.discordapp.com/avatar-decoration-presets/123456789012345678.png"
   *
   * // Premium subscriber exclusive decoration
   * const premiumDecoration = Cdn.avatarDecoration("premium_frame_id_12345");
   * // Result: "https://cdn.discordapp.com/avatar-decoration-presets/premium_frame_id_12345.png"
   *
   * // Event-specific decoration
   * const eventDecoration = Cdn.avatarDecoration("event_decoration_67890");
   * // Result: "https://cdn.discordapp.com/avatar-decoration-presets/event_decoration_67890.png"
   * ```
   *
   * @see {@link AvatarDecorationUrl} - For avatar decoration URL type definition
   * @see {@link Cdn.userAvatar} - For the base avatar that decorations overlay
   *
   * @public
   */
  avatarDecoration(assetId: Snowflake): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },

  /**
   * Generates URLs for Discord application icon assets for app directory listings.
   *
   * Creates properly formatted URLs for application icon assets that represent
   * Discord bots and applications in various Discord interfaces.
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Application icon asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the application icon asset
   *
   * @throws {Error} Invalid application ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Application icon usage contexts:
   * - **App directory**: Primary visual identifier in Discord's application marketplace
   * - **Bot profiles**: Shown in bot user profiles and integration settings
   * - **Integration UI**: Displayed in slash command interfaces and embeds
   * - **Verification process**: Required for public bot verification and listings
   * - **Branding consistency**: Central element of application brand identity
   *
   * @example
   * ```typescript
   * // Standard bot application icon
   * const botIcon = Cdn.applicationIcon(
   *   "123456789012345678",
   *   "app_icon_hash_12345",
   *   { size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/app_icon_hash_12345.png?size=256"
   *
   * // High-resolution icon for app directory
   * const appDirectoryIcon = Cdn.applicationIcon(
   *   "123456789012345678",
   *   "high_res_icon_hash",
   *   { size: 512, format: "webp" }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/high_res_icon_hash.webp?size=512"
   *
   * // JPEG format for photographic app icons
   * const photoIcon = Cdn.applicationIcon(
   *   "123456789012345678",
   *   "photo_icon_hash",
   *   { format: "jpeg", size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/photo_icon_hash.jpeg?size=128"
   * ```
   *
   * @see {@link ApplicationIconUrl} - For application icon URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.applicationCover} - For application cover images
   *
   * @public
   */
  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationIconUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-icons/${applicationId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord application cover images for app directory banners.
   *
   * Creates properly formatted URLs for application cover assets that serve as
   * promotional banner images in Discord's application directory and marketplace.
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Application cover asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the application cover asset
   *
   * @throws {Error} Invalid application ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Application cover specifications:
   * - **Banner display**: Featured prominently in app directory listings
   * - **Marketing focus**: Key visual element for application promotion
   * - **Dimensions**: Landscape aspect ratio optimized for banner presentation
   * - **Quality importance**: High-resolution recommended for professional appearance
   * - **Discovery impact**: Significantly influences user engagement and app discovery
   *
   * @example
   * ```typescript
   * // App directory cover banner
   * const appCover = Cdn.applicationCover(
   *   "123456789012345678",
   *   "cover_banner_hash",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/cover_banner_hash.png?size=1024"
   *
   * // WebP format for bandwidth optimization
   * const optimizedCover = Cdn.applicationCover(
   *   "123456789012345678",
   *   "optimized_cover_hash",
   *   { format: "webp", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/optimized_cover_hash.webp?size=512"
   *
   * // High-quality JPEG for photographic covers
   * const photoCover = Cdn.applicationCover(
   *   "123456789012345678",
   *   "photo_cover_hash",
   *   { format: "jpeg", size: 2048 }
   * );
   * // Result: "https://cdn.discordapp.com/app-icons/123456789012345678/photo_cover_hash.jpeg?size=2048"
   * ```
   *
   * @see {@link ApplicationCoverUrl} - For application cover URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.applicationIcon} - For application profile icons
   *
   * @public
   */
  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationCoverUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-icons/${applicationId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for custom application asset images for rich presence and integrations.
   *
   * Creates properly formatted URLs for application asset resources used in
   * rich presence displays, slash command responses, and application integrations.
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Application asset identifier string
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the application asset
   *
   * @throws {Error} Invalid application ID or unsupported option values
   *
   * @remarks
   * Application asset use cases:
   * - **Rich Presence**: Large and small images displayed in user status/activity
   * - **Slash Commands**: Custom images in command responses and embeds
   * - **Game Integration**: Screenshots, logos, and promotional imagery
   * - **Bot Features**: Custom visual elements for enhanced user experience
   * - **Branding**: Consistent visual identity across application features
   *
   * @example
   * ```typescript
   * // Rich presence large image for game status
   * const gameAsset = Cdn.applicationAsset(
   *   "123456789012345678",
   *   "game_logo_large",
   *   { size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/game_logo_large.png?size=512"
   *
   * // Rich presence small image (status indicator)
   * const statusAsset = Cdn.applicationAsset(
   *   "123456789012345678",
   *   "status_indicator_small",
   *   { size: 128, format: "webp" }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/status_indicator_small.webp?size=128"
   *
   * // Custom embed image for slash command
   * const embedAsset = Cdn.applicationAsset(
   *   "123456789012345678",
   *   "custom_embed_image",
   *   { format: "jpeg", size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/custom_embed_image.jpeg?size=256"
   * ```
   *
   * @see {@link ApplicationAssetUrl} - For application asset URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.achievementIcon} - For achievement-specific assets
   *
   * @public
   */
  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationAssetUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/${assetId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for achievement icon assets for Discord's gaming achievements system.
   *
   * Creates properly formatted URLs for achievement icon assets that represent
   * gaming accomplishments and milestones within Discord's integrated features.
   *
   * @param applicationId - Discord application snowflake ID
   * @param achievementId - Achievement snowflake ID
   * @param iconHash - Achievement icon asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the achievement icon asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported option values
   *
   * @remarks
   * Achievement icon system features:
   * - **Gaming integration**: Part of Discord's rich gaming ecosystem
   * - **Visual recognition**: Represents user accomplishments and milestones
   * - **Profile display**: Shown in user profiles and achievement galleries
   * - **Notification system**: Appears in achievement unlock notifications
   * - **Social sharing**: Enables sharing of gaming accomplishments
   *
   * @example
   * ```typescript
   * // Standard gaming achievement icon
   * const achievementIcon = Cdn.achievementIcon(
   *   "123456789012345678", // Application ID
   *   "987654321098765432", // Achievement ID
   *   "achievement_icon_hash",
   *   { size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/987654321098765432/icons/achievement_icon_hash.png?size=128"
   *
   * // High-resolution achievement for profile display
   * const profileAchievement = Cdn.achievementIcon(
   *   "123456789012345678",
   *   "555666777888999000",
   *   "rare_achievement_hash",
   *   { size: 256, format: "webp" }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/555666777888999000/icons/rare_achievement_hash.webp?size=256"
   *
   * // Small achievement icon for notification
   * const notificationIcon = Cdn.achievementIcon(
   *   "123456789012345678",
   *   "111222333444555666",
   *   "notification_icon_hash",
   *   { size: 64 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/111222333444555666/icons/notification_icon_hash.png?size=64"
   * ```
   *
   * @see {@link AchievementIconUrl} - For achievement icon URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.applicationAsset} - For general application assets
   *
   * @public
   */
  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    iconHash: string,
    options: z.input<typeof ImageOptions> = {},
  ): AchievementIconUrl {
    // Validate the hash format
    validateWithZod(AssetHash, iconHash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for store page asset images for Discord's application marketplace.
   *
   * Creates properly formatted URLs for store page assets used in Discord's
   * application store listings and promotional content.
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Store page asset identifier string
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the store page asset
   *
   * @throws {Error} Invalid application ID or unsupported option values
   *
   * @remarks
   * Store page asset categories:
   * - **Screenshots**: Application functionality demonstrations
   * - **Feature highlights**: Key capability visual presentations
   * - **Promotional banners**: Marketing and promotional imagery
   * - **User interface**: Interface mockups and design showcases
   * - **Workflow demonstrations**: Step-by-step usage illustrations
   *
   * @example
   * ```typescript
   * // Application screenshot for store listing
   * const screenshot = Cdn.storePageAsset(
   *   "123456789012345678",
   *   "screenshot_main_interface",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/store/screenshot_main_interface.png?size=1024"
   *
   * // Feature highlight banner
   * const featureBanner = Cdn.storePageAsset(
   *   "123456789012345678",
   *   "feature_highlight_banner",
   *   { format: "webp", size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/store/feature_highlight_banner.webp?size=512"
   *
   * // Promotional image for marketing
   * const promoImage = Cdn.storePageAsset(
   *   "123456789012345678",
   *   "promotional_showcase",
   *   { format: "jpeg", size: 2048 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/123456789012345678/store/promotional_showcase.jpeg?size=2048"
   * ```
   *
   * @see {@link StorePageAssetUrl} - For store page asset URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.applicationCover} - For application cover images
   *
   * @public
   */
  storePageAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): StorePageAssetUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/store/${assetId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for sticker pack banner images for Discord's sticker marketplace.
   *
   * Creates properly formatted URLs for sticker pack banner assets that represent
   * collections of stickers in Discord's sticker shop and marketplace.
   *
   * @param bannerId - Sticker pack banner asset identifier string
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the sticker pack banner asset
   *
   * @throws {Error} Invalid banner ID or unsupported option values
   *
   * @remarks
   * Sticker pack banner characteristics:
   * - **Official application**: Uses Discord's official sticker application ID (710982414301790216)
   * - **Marketplace presence**: Displayed prominently in Discord's sticker shop
   * - **Collection branding**: Represents themed sticker collections and packs
   * - **Promotional focus**: Key visual element for sticker pack discovery
   * - **Consistent format**: Standardized across all official Discord sticker packs
   *
   * @example
   * ```typescript
   * // Official Discord sticker pack banner
   * const officialPack = Cdn.stickerPackBanner(
   *   "winter_holidays_2023",
   *   { size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/710982414301790216/store/winter_holidays_2023.png?size=512"
   *
   * // Seasonal sticker collection banner
   * const seasonalPack = Cdn.stickerPackBanner(
   *   "spring_collection_banner",
   *   { format: "webp", size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/710982414301790216/store/spring_collection_banner.webp?size=256"
   *
   * // High-resolution pack banner for feature display
   * const featuredPack = Cdn.stickerPackBanner(
   *   "featured_artist_collection",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/app-assets/710982414301790216/store/featured_artist_collection.png?size=1024"
   * ```
   *
   * @see {@link StickerPackBannerUrl} - For sticker pack banner URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.sticker} - For individual sticker assets
   *
   * @public
   */
  stickerPackBanner(
    bannerId: string,
    options: z.input<typeof ImageOptions> = {},
  ): StickerPackBannerUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/710982414301790216/store/${bannerId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord development team icon assets.
   *
   * Creates properly formatted URLs for team icon assets that provide visual
   * identification for development teams in Discord's developer portal.
   *
   * @param teamId - Discord team snowflake ID
   * @param hash - Team icon asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the team icon asset
   *
   * @throws {Error} Invalid team ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Team icon functionality:
   * - **Developer portal**: Visual identifier in Discord Developer Portal interface
   * - **Team management**: Used in team settings and member management views
   * - **Application ownership**: Represents team ownership of Discord applications
   * - **Professional branding**: Corporate and organization identity representation
   * - **Access control**: Visible to team members and authorized personnel
   *
   * @example
   * ```typescript
   * // Standard development team icon
   * const teamIcon = Cdn.teamIcon(
   *   "123456789012345678",
   *   "team_logo_hash_12345",
   *   { size: 256 }
   * );
   * // Result: "https://cdn.discordapp.com/team-icons/123456789012345678/team_logo_hash_12345.png?size=256"
   *
   * // High-resolution team icon for portal display
   * const highResTeamIcon = Cdn.teamIcon(
   *   "123456789012345678",
   *   "high_res_logo_hash",
   *   { size: 512, format: "webp" }
   * );
   * // Result: "https://cdn.discordapp.com/team-icons/123456789012345678/high_res_logo_hash.webp?size=512"
   *
   * // Corporate team branding
   * const corporateIcon = Cdn.teamIcon(
   *   "123456789012345678",
   *   "corporate_branding_hash",
   *   { format: "jpeg", size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/team-icons/123456789012345678/corporate_branding_hash.jpeg?size=128"
   * ```
   *
   * @see {@link TeamIconUrl} - For team icon URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.applicationIcon} - For application-specific icons
   *
   * @public
   */
  teamIcon(
    teamId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): TeamIconUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `team-icons/${teamId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord sticker assets with comprehensive format support.
   *
   * Creates properly formatted URLs for sticker assets supporting static images,
   * animated GIFs, and Lottie vector animations with intelligent delivery optimization.
   *
   * @param stickerId - Discord sticker snowflake ID
   * @param options - Sticker-specific formatting options including format and media proxy preferences
   * @returns Complete URL to the sticker asset
   *
   * @throws {Error} Invalid sticker ID or unsupported option values
   *
   * @remarks
   * Sticker format capabilities:
   * - **Static stickers**: PNG format for simple image-based expressions
   * - **Animated stickers**: GIF format with optional media proxy optimization
   * - **Lottie stickers**: JSON format for scalable vector-based animations
   * - **Performance optimization**: Automatic media proxy usage for GIF stickers
   * - **Universal compatibility**: PNG default ensures broad device support
   *
   * @example
   * ```typescript
   * // Standard static PNG sticker
   * const staticSticker = Cdn.sticker(
   *   "123456789012345678",
   *   { size: 320 }
   * );
   * // Result: "https://cdn.discordapp.com/stickers/123456789012345678.png?size=320"
   *
   * // Animated GIF sticker with media proxy optimization
   * const animatedSticker = Cdn.sticker(
   *   "987654321098765432",
   *   { format: "gif", size: 320, useMediaProxy: true }
   * );
   * // Result: "https://media.discordapp.net/stickers/987654321098765432.gif?size=320"
   *
   * // Lottie vector animation sticker
   * const lottieSticker = Cdn.sticker(
   *   "555666777888999000",
   *   { format: "json" }
   * );
   * // Result: "https://cdn.discordapp.com/stickers/555666777888999000.json"
   *
   * // GIF sticker without media proxy
   * const directGifSticker = Cdn.sticker(
   *   "111222333444555666",
   *   { format: "gif", size: 160, useMediaProxy: false }
   * );
   * // Result: "https://cdn.discordapp.com/stickers/111222333444555666.gif?size=160"
   * ```
   *
   * @see {@link StickerUrl} - For sticker URL type definition
   * @see {@link StickerFormatOptions} - For sticker-specific options
   * @see {@link StickerPackBannerUrl} - For sticker pack banners
   *
   * @public
   */
  sticker(
    stickerId: Snowflake,
    options: z.input<typeof StickerFormatOptions> = {},
  ): StickerUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(StickerFormatOptions, options);

    // Special handling for GIF stickers - use media proxy for better performance
    if (validatedOptions.format === "gif") {
      return this.buildUrl(
        `stickers/${stickerId}.gif`,
        validatedOptions.size,
        validatedOptions.useMediaProxy,
      );
    }

    return this.buildUrl(
      `stickers/${stickerId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord server role icon assets for role customization.
   *
   * Creates properly formatted URLs for role icon assets that provide visual
   * identification for server roles in member lists and role management interfaces.
   *
   * @param roleId - Discord role snowflake ID
   * @param hash - Role icon asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the role icon asset
   *
   * @throws {Error} Invalid role ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Role icon specifications:
   * - **Boost requirement**: Available to servers with appropriate boost level
   * - **Small format**: Designed for small UI elements (16x16 to 64x64px typical)
   * - **Member list display**: Appears next to role names in server member lists
   * - **Role hierarchy**: Visual distinction for different permission levels
   * - **Static format**: Currently supports static images only
   *
   * @example
   * ```typescript
   * // Moderator role icon
   * const moderatorIcon = Cdn.roleIcon(
   *   "123456789012345678",
   *   "moderator_badge_hash",
   *   { size: 64 }
   * );
   * // Result: "https://cdn.discordapp.com/role-icons/123456789012345678/moderator_badge_hash.png?size=64"
   *
   * // VIP member role icon with WebP optimization
   * const vipIcon = Cdn.roleIcon(
   *   "123456789012345678",
   *   "vip_crown_hash",
   *   { format: "webp", size: 32 }
   * );
   * // Result: "https://cdn.discordapp.com/role-icons/123456789012345678/vip_crown_hash.webp?size=32"
   *
   * // Admin role icon for high-resolution display
   * const adminIcon = Cdn.roleIcon(
   *   "123456789012345678",
   *   "admin_shield_hash",
   *   { size: 128 }
   * );
   * // Result: "https://cdn.discordapp.com/role-icons/123456789012345678/admin_shield_hash.png?size=128"
   * ```
   *
   * @see {@link RoleIconUrl} - For role icon URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.guildIcon} - For server-wide guild icons
   *
   * @public
   */
  roleIcon(
    roleId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): RoleIconUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `role-icons/${roleId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild scheduled event cover images for event promotion.
   *
   * Creates properly formatted URLs for scheduled event cover assets that enhance
   * event visibility and engagement in Discord server event systems.
   *
   * @param eventId - Discord scheduled event snowflake ID
   * @param hash - Event cover asset hash
   * @param options - Image formatting options including format and size preferences
   * @returns Complete URL to the scheduled event cover asset
   *
   * @throws {Error} Invalid event ID, malformed hash, or unsupported option values
   *
   * @remarks
   * Scheduled event cover features:
   * - **Event promotion**: Key visual element for event discovery and engagement
   * - **Event listings**: Displayed prominently in event discovery interfaces
   * - **Community engagement**: Increases event visibility and member participation
   * - **Landscape format**: Optimized for event card and banner display
   * - **Static format**: Currently supports static images only
   *
   * @example
   * ```typescript
   * // Gaming tournament event cover
   * const tournamentCover = Cdn.guildScheduledEventCover(
   *   "123456789012345678",
   *   "tournament_banner_hash",
   *   { size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/guild-events/123456789012345678/tournament_banner_hash.png?size=512"
   *
   * // Community meetup event cover
   * const meetupCover = Cdn.guildScheduledEventCover(
   *   "987654321098765432",
   *   "meetup_cover_hash",
   *   { format: "webp", size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/guild-events/987654321098765432/meetup_cover_hash.webp?size=1024"
   *
   * // Photographic event cover
   * const photoCover = Cdn.guildScheduledEventCover(
   *   "555666777888999000",
   *   "photo_event_cover",
   *   { format: "jpeg", size: 2048 }
   * );
   * // Result: "https://cdn.discordapp.com/guild-events/555666777888999000/photo_event_cover.jpeg?size=2048"
   * ```
   *
   * @see {@link GuildScheduledEventCoverUrl} - For event cover URL type definition
   * @see {@link ImageOptions} - For static image options
   * @see {@link Cdn.guildBanner} - For general guild banners
   *
   * @public
   */
  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildScheduledEventCoverUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `guild-events/${eventId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for guild-specific member banner images for enhanced server profiles.
   *
   * Creates properly formatted URLs for guild member banner assets that allow
   * users to customize their profile appearance within specific Discord servers.
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Guild member banner asset hash (may include "a_" prefix for animated banners)
   * @param options - Image formatting options including animation and size preferences
   * @returns Complete URL to the guild member banner asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported option values
   *
   * @remarks
   * Guild member banner capabilities:
   * - **Server-specific customization**: Overrides global user banner within specific guild
   * - **Context-aware branding**: Different banner for different server communities
   * - **Animation support**: Supports animated banners for eligible users
   * - **Fallback behavior**: Falls back to global user banner if no guild-specific banner
   * - **Community identity**: Allows users to express server-specific identity
   *
   * @example
   * ```typescript
   * // Guild-specific member profile banner
   * const guildBanner = Cdn.guildMemberBanner(
   *   "123456789012345678", // Guild ID
   *   "987654321098765432", // User ID
   *   "guild_banner_hash",
   *   { size: 512 }
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/banners/guild_banner_hash.png?size=512"
   *
   * // Animated guild member banner
   * const animatedGuildBanner = Cdn.guildMemberBanner(
   *   "123456789012345678",
   *   "987654321098765432",
   *   "a_animated_guild_banner"
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/banners/a_animated_guild_banner.gif"
   *
   * // High-resolution guild banner for profile display
   * const highResBanner = Cdn.guildMemberBanner(
   *   "123456789012345678",
   *   "987654321098765432",
   *   "high_res_guild_banner",
   *   { format: "webp", size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/guilds/123456789012345678/users/987654321098765432/banners/high_res_guild_banner.webp?size=1024"
   * ```
   *
   * @see {@link GuildMemberBannerUrl} - For guild member banner URL type definition
   * @see {@link Cdn.userBanner} - For global user profile banners
   * @see {@link Cdn.guildMemberAvatar} - For guild-specific member avatars
   *
   * @public
   */
  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberBannerUrl {
    // Validate the hash format
    validateWithZod(AssetHash, hash);

    // Validate and parse the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/banners/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord message attachment assets for file sharing and media.
   *
   * Creates properly formatted URLs for message attachment assets that provide
   * access to files uploaded to Discord messages across various media types.
   *
   * @param channelId - Discord channel snowflake ID where the message was sent
   * @param attachmentId - Message attachment snowflake ID
   * @param filename - Original filename of the uploaded attachment
   * @param options - Base image options (size parameter, format determined by original file)
   * @returns Complete URL to the message attachment asset
   *
   * @throws {Error} Invalid IDs or unsupported option values
   *
   * @remarks
   * Attachment URL characteristics:
   * - **File preservation**: Maintains original filename with proper URL encoding
   * - **Format variety**: Supports images, documents, audio, video, and other file types
   * - **Persistence**: URLs remain valid as long as the parent message exists
   * - **Size processing**: Images support automatic resizing via size parameter
   * - **Security**: Includes attachment ID for access control and validation
   *
   * @example
   * ```typescript
   * // Image attachment with automatic resizing
   * const imageAttachment = Cdn.attachment(
   *   "123456789012345678", // Channel ID
   *   "987654321098765432", // Attachment ID
   *   "vacation_photo.jpg",
   *   { size: 1024 }
   * );
   * // Result: "https://cdn.discordapp.com/attachments/123456789012345678/987654321098765432/vacation_photo.jpg?size=1024"
   *
   * // Document attachment preserving original filename
   * const documentAttachment = Cdn.attachment(
   *   "123456789012345678",
   *   "555666777888999000",
   *   "project_proposal.pdf"
   * );
   * // Result: "https://cdn.discordapp.com/attachments/123456789012345678/555666777888999000/project_proposal.pdf"
   *
   * // Audio file with special characters in filename
   * const audioAttachment = Cdn.attachment(
   *   "123456789012345678",
   *   "111222333444555666",
   *   "song with spaces & symbols.mp3"
   * );
   * // Result: "https://cdn.discordapp.com/attachments/123456789012345678/111222333444555666/song%20with%20spaces%20%26%20symbols.mp3"
   *
   * // High-resolution image for detailed viewing
   * const highResImage = Cdn.attachment(
   *   "123456789012345678",
   *   "777888999000111222",
   *   "screenshot.png",
   *   { size: 2048 }
   * );
   * // Result: "https://cdn.discordapp.com/attachments/123456789012345678/777888999000111222/screenshot.png?size=2048"
   * ```
   *
   * @see {@link AttachmentUrl} - For attachment URL type definition
   * @see {@link BaseImageOptions} - For size options (format determined by file)
   *
   * @public
   */
  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options: z.input<typeof BaseImageOptions> = {},
  ): AttachmentUrl {
    // Validate and parse the options
    const validatedOptions = validateWithZod(BaseImageOptions, options);

    return this.buildUrl(
      `attachments/${channelId}/${attachmentId}/${encodeURIComponent(filename)}`,
      validatedOptions.size,
    );
  },
} as const;
