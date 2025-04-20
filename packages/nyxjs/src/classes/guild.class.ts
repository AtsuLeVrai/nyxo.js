import {
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  type AvatarDecorationDataEntity,
  type BanEntity,
  BitField,
  type DefaultMessageNotificationLevel,
  type EmojiEntity,
  type ExplicitContentFilterLevel,
  type GuildFeature,
  type GuildMemberEntity,
  type GuildMemberFlags,
  type IntegrationAccountEntity,
  type IntegrationApplicationEntity,
  type IntegrationEntity,
  type IntegrationExpirationBehavior,
  type Locale,
  type MfaLevel,
  type NsfwLevel,
  type OAuth2Scope,
  type PremiumTier,
  type RoleEntity,
  type Snowflake,
  type SystemChannelFlags,
  type VerificationLevel,
  type VoiceStateEntity,
} from "@nyxojs/core";
import type { GuildCreateEntity, PresenceEntity } from "@nyxojs/gateway";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import type { AnyChannel, AnyThreadChannel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { Role } from "./role.class.js";
import { GuildScheduledEvent } from "./scheduled-event.class.js";
import { SoundboardSound } from "./soundboard-sound.class.js";
import { StageInstance } from "./stage-instance.class.js";
import { User } from "./user.class.js";

@Cacheable<GuildBased<BanEntity>>(
  "bans",
  (data) => `${data.guild_id}:${data.user.id}`,
)
export class Ban
  extends BaseClass<GuildBased<BanEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<BanEntity>>>
{
  get reason(): string | null {
    return this.data.reason;
  }

  get user(): User {
    return new User(this.client, this.data.user);
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }
}

@Cacheable<GuildBased<GuildMemberEntity>>(
  "members",
  (data) => `${data.guild_id}:${data.user.id}`,
)
export class GuildMember
  extends BaseClass<GuildBased<GuildMemberEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<GuildMemberEntity>>>
{
  get user(): User {
    return new User(this.client, this.data.user);
  }

  get nick(): string | null | undefined {
    return this.data.nick;
  }

  get avatar(): string | null | undefined {
    return this.data.avatar;
  }

  get banner(): string | null | undefined {
    return this.data.banner;
  }

  get roles(): Snowflake[] {
    return this.data.roles;
  }

  get joinedAt(): string {
    return this.data.joined_at;
  }

  get premiumSince(): string | null | undefined {
    return this.data.premium_since;
  }

  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  get flags(): BitField<GuildMemberFlags> {
    return new BitField<GuildMemberFlags>(this.data.flags);
  }

  get pending(): boolean {
    return Boolean(this.data.pending);
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get communicationDisabledUntil(): string | null | undefined {
    return this.data.communication_disabled_until;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null | undefined {
    return this.data.avatar_decoration_data;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }
}

@Cacheable("integrations")
export class Integration
  extends BaseClass<GuildBased<IntegrationEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<IntegrationEntity>>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string {
    return this.data.name;
  }

  get type(): string {
    return this.data.type;
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get syncing(): boolean {
    return Boolean(this.data.syncing);
  }

  get roleId(): Snowflake | undefined {
    return this.data.role_id;
  }

  get enableEmoticons(): boolean {
    return Boolean(this.data.enable_emoticons);
  }

  get expireBehavior(): IntegrationExpirationBehavior | undefined {
    return this.data.expire_behavior;
  }

  get expireGracePeriod(): number | undefined {
    return this.data.expire_grace_period;
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user);
  }

  get account(): IntegrationAccountEntity {
    return this.data.account;
  }

  get syncedAt(): string | undefined {
    return this.data.synced_at;
  }

  get subscriberCount(): number | undefined {
    return this.data.subscriber_count;
  }

  get revoked(): boolean {
    return Boolean(this.data.revoked);
  }

  get application(): IntegrationApplicationEntity | undefined {
    return this.data.application;
  }

  get scopes(): OAuth2Scope[] | undefined {
    return this.data.scopes;
  }
}

@Cacheable("guilds")
export class Guild extends BaseClass<GuildCreateEntity> {
  // implements Enforce<CamelCasedProperties<GuildCreateEntity>>
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon;
  }

  get iconHash(): string | null | undefined {
    return this.data.icon_hash;
  }

  get splash(): string | null {
    return this.data.splash;
  }

  get discoverySplash(): string | null {
    return this.data.discovery_splash;
  }

  get owner(): boolean {
    return Boolean(this.data.owner);
  }

  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get region(): string | null | undefined {
    return this.data.region;
  }

  get afkChannelId(): Snowflake | null {
    return this.data.afk_channel_id;
  }

  get afkTimeout(): number {
    return this.data.afk_timeout;
  }

  get widgetEnabled(): boolean {
    return Boolean(this.data.widget_enabled);
  }

  get widgetChannelId(): Snowflake | null | undefined {
    return this.data.widget_channel_id;
  }

  get verificationLevel(): VerificationLevel {
    return this.data.verification_level;
  }

  get defaultMessageNotifications(): DefaultMessageNotificationLevel {
    return this.data.default_message_notifications;
  }

  get explicitContentFilter(): ExplicitContentFilterLevel {
    return this.data.explicit_content_filter;
  }

  get roles(): Role[] {
    return this.data.roles.map(
      (role) => new Role(this.client, role as GuildBased<RoleEntity>),
    );
  }

  get emojis(): Emoji[] {
    return this.data.emojis.map(
      (emoji) => new Emoji(this.client, emoji as GuildBased<EmojiEntity>),
    );
  }

  get features(): GuildFeature[] {
    return this.data.features;
  }

  get mfaLevel(): MfaLevel {
    return this.data.mfa_level;
  }

  get applicationId(): Snowflake | null {
    return this.data.application_id;
  }

  get systemChannelId(): Snowflake | null {
    return this.data.system_channel_id;
  }

  get systemChannelFlags(): BitField<SystemChannelFlags> {
    return new BitField<SystemChannelFlags>(this.data.system_channel_flags);
  }

  get rulesChannelId(): Snowflake | null {
    return this.data.rules_channel_id;
  }

  get maxPresences(): number | null | undefined {
    return this.data.max_presences;
  }

  get maxMembers(): number {
    return this.data.max_members;
  }

  get vanityUrlCode(): string | null {
    return this.data.vanity_url_code;
  }

  get description(): string | null {
    return this.data.description;
  }

  get banner(): string | null {
    return this.data.banner;
  }

  get premiumTier(): PremiumTier {
    return this.data.premium_tier;
  }

  get premiumSubscriptionCount(): number | undefined {
    return this.data.premium_subscription_count;
  }

  get preferredLocale(): Locale {
    return this.data.preferred_locale;
  }

  get publicUpdatesChannelId(): Snowflake | null {
    return this.data.public_updates_channel_id;
  }

  get maxVideoChannelUsers(): number | undefined {
    return this.data.max_video_channel_users;
  }

  get maxStageVideoChannelUsers(): number | undefined {
    return this.data.max_stage_video_channel_users;
  }

  get approximateMemberCount(): number | undefined {
    return this.data.approximate_member_count;
  }

  get approximatePresenceCount(): number | undefined {
    return this.data.approximate_presence_count;
  }

  get nsfwLevel(): NsfwLevel {
    return this.data.nsfw_level;
  }

  get premiumProgressBarEnabled(): boolean {
    return Boolean(this.data.premium_progress_bar_enabled);
  }

  get safetyAlertsChannelId(): Snowflake | null {
    return this.data.safety_alerts_channel_id;
  }

  get joinedAt(): string {
    return this.data.joined_at;
  }

  get large(): boolean {
    return Boolean(this.data.large);
  }

  get unavailable(): boolean {
    return Boolean(this.data.unavailable);
  }

  get memberCount(): number {
    return this.data.member_count;
  }

  get voiceStates(): Partial<VoiceStateEntity>[] {
    return this.data.voice_states;
  }

  get members(): GuildMember[] {
    return this.data.members.map(
      (member) =>
        new GuildMember(this.client, member as GuildBased<GuildMemberEntity>),
    );
  }

  get channels(): AnyChannel[] {
    return this.data.channels.map((channel) =>
      ChannelFactory.create(this.client, channel as AnyChannelEntity),
    );
  }

  get threads(): AnyThreadChannel[] {
    return this.data.threads.map((thread) =>
      ChannelFactory.createThread(
        this.client,
        thread as AnyThreadChannelEntity,
      ),
    );
  }

  get presences(): Partial<PresenceEntity>[] {
    return this.data.presences;
  }

  get stageInstances(): StageInstance[] {
    return this.data.stage_instances.map(
      (stageInstance) => new StageInstance(this.client, stageInstance),
    );
  }

  get guildScheduledEvents(): GuildScheduledEvent[] {
    return this.data.guild_scheduled_events.map(
      (event) => new GuildScheduledEvent(this.client, event),
    );
  }

  get soundboardSounds(): SoundboardSound[] {
    return this.data.soundboard_sounds.map(
      (sound) => new SoundboardSound(this.client, sound),
    );
  }
}
