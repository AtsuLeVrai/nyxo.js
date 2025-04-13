import type {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  EmojiEntity,
  RoleEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import {
  BitField,
  type DefaultMessageNotificationLevel,
  type ExplicitContentFilterLevel,
  type GuildFeature,
  type GuildMemberEntity,
  type Locale,
  type MfaLevel,
  type NsfwLevel,
  type PremiumTier,
  type Snowflake,
  type SystemChannelFlags,
  type VerificationLevel,
} from "@nyxjs/core";
import type { GuildCreateEntity, PresenceEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import type { AnyChannel, AnyThreadChannel } from "../channels/index.js";
import { Emoji } from "../emojis/index.js";
import { Role } from "../roles/index.js";
import { GuildScheduledEvent } from "../scheduled-events/index.js";
import { SoundboardSound } from "../soundboards/index.js";
import { StageInstance } from "../stage-instances/index.js";
import { GuildMember } from "./guild-member.class.js";

export class Guild
  extends BaseClass<GuildCreateEntity>
  implements EnforceCamelCase<GuildCreateEntity>
{
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
      ChannelFactory.create(this.client, thread as AnyThreadChannelEntity),
    ) as AnyThreadChannel[];
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "guilds",
      id: this.id,
    };
  }
}
