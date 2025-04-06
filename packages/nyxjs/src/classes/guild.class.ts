import type {
  BanEntity,
  IntegrationAccountEntity,
  IntegrationApplicationEntity,
} from "@nyxjs/core";
import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type DefaultMessageNotificationLevel,
  type ExplicitContentFilterLevel,
  type GuildEntity,
  type GuildFeature,
  type GuildMemberEntity,
  type GuildMemberFlags,
  type IntegrationEntity,
  type IntegrationExpirationBehavior,
  type Locale,
  type MfaLevel,
  type NsfwLevel,
  type OAuth2Scope,
  type PremiumTier,
  type Snowflake,
  type SystemChannelFlags,
  type VerificationLevel,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import { Emoji } from "./emoji.class.js";
import { Role } from "./role.class.js";
import { User } from "./user.class.js";

export class Guild extends BaseClass<GuildEntity> {
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

  get widgetEnabled(): boolean | undefined {
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
    return this.data.roles.map((role) => Role.from(this.client, role));
  }

  get emojis(): Emoji[] {
    return this.data.emojis.map((emoji) => Emoji.from(this.client, emoji));
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

  get systemChannelFlags(): BitFieldManager<SystemChannelFlags> {
    return new BitFieldManager<SystemChannelFlags>(
      this.data.system_channel_flags,
    );
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "guilds",
      id: this.id,
    };
  }
}

export class Ban extends BaseClass<BanEntity> {
  get reason(): string | null {
    return this.data.reason;
  }

  get user(): User {
    return User.from(this.client, this.data.user);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class GuildMember extends BaseClass<GuildMemberEntity> {
  get user(): User {
    return User.from(this.client, this.data.user);
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

  get flags(): BitFieldManager<GuildMemberFlags> {
    return new BitFieldManager<GuildMemberFlags>(this.data.flags);
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "members",
      id: this.user.id,
    };
  }
}

export class IntegrationApplication extends BaseClass<IntegrationApplicationEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon;
  }

  get description(): string | null {
    return this.data.description;
  }

  get bot(): User | undefined {
    if (!this.data.bot) {
      return undefined;
    }

    return User.from(this.client, this.data.bot);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Integration extends BaseClass<IntegrationEntity> {
  get id(): Snowflake {
    return this.data.id;
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

    return User.from(this.client, this.data.user);
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

  get application(): IntegrationApplication | undefined {
    if (!this.data.application) {
      return undefined;
    }

    return IntegrationApplication.from(this.client, this.data.application);
  }

  get scopes(): OAuth2Scope[] | undefined {
    return this.data.scopes;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "integrations",
      id: this.id,
    };
  }
}
