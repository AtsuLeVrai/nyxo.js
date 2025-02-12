import {
  BitFieldManager,
  type ExplicitContentFilterLevel,
  type GuildFeature,
  type Locale,
  type MfaLevel,
  type NsfwLevel,
  type PremiumTier,
  type Snowflake,
  type SystemChannelFlags,
  type VerificationLevel,
} from "@nyxjs/core";
import { GuildCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { type AnyThreadChannel, resolveThreadChannel } from "../utils/index.js";
import { Channel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { GuildMember } from "./guild-member.class.js";
import { GuildScheduledEvent } from "./guild-scheduled-event.class.js";
import { Role } from "./role.class.js";
import { SoundboardSound } from "./soundboard-sound.class.js";
import { StageInstance } from "./stage-instance.class.js";
import { Sticker } from "./sticker.class.js";
import { VoiceState } from "./voice-state.class.js";
import { WelcomeScreen } from "./welcome-screen.class.js";

export class Guild extends BaseClass<GuildCreateEntity> {
  readonly #systemChannelFlags: BitFieldManager<SystemChannelFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildCreateEntity>> = {},
  ) {
    super(client, GuildCreateEntity, entity);
    this.#systemChannelFlags = new BitFieldManager(
      this.entity.system_channel_flags,
    );
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get iconHash(): string | null {
    return this.entity.icon_hash ?? null;
  }

  get splash(): string | null {
    return this.entity.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.entity.discovery_splash ?? null;
  }

  get owner(): boolean {
    return Boolean(this.entity.owner);
  }

  get ownerId(): Snowflake {
    return this.entity.owner_id;
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get region(): string | null {
    return this.entity.region ?? null;
  }

  get afkChannelId(): Snowflake | null {
    return this.entity.afk_channel_id ?? null;
  }

  get afkTimeout(): number {
    return this.entity.afk_timeout;
  }

  get widgetEnabled(): boolean {
    return Boolean(this.entity.widget_enabled);
  }

  get widgetChannelId(): string | null {
    return this.entity.widget_channel_id ?? null;
  }

  get verificationLevel(): VerificationLevel {
    return this.entity.verification_level;
  }

  get defaultMessageNotifications(): unknown {
    return this.entity.default_message_notifications;
  }

  get explicitContentFilter(): ExplicitContentFilterLevel {
    return this.entity.explicit_content_filter;
  }

  get roles(): Role[] {
    return Array.isArray(this.entity.roles)
      ? this.entity.roles.map((role) => new Role(this.client, role))
      : [];
  }

  get emojis(): Emoji[] {
    return Array.isArray(this.entity.emojis)
      ? this.entity.emojis.map((emoji) => new Emoji(this.client, emoji))
      : [];
  }

  get features(): (GuildFeature | string)[] {
    return Array.isArray(this.entity.features) ? [...this.entity.features] : [];
  }

  get mfaLevel(): MfaLevel {
    return this.entity.mfa_level;
  }

  get applicationId(): Snowflake | null {
    return this.entity.application_id ?? null;
  }

  get systemChannelId(): Snowflake | null {
    return this.entity.system_channel_id ?? null;
  }

  get systemChannelFlags(): BitFieldManager<SystemChannelFlags> {
    return this.#systemChannelFlags;
  }

  get rulesChannelId(): Snowflake | null {
    return this.entity.rules_channel_id ?? null;
  }

  get maxPresences(): number | null {
    return this.entity.max_presences ?? null;
  }

  get maxMembers(): number {
    return this.entity.max_members;
  }

  get vanityUrlCode(): string | null {
    return this.entity.vanity_url_code ?? null;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get banner(): string | null {
    return this.entity.banner ?? null;
  }

  get premiumTier(): PremiumTier {
    return this.entity.premium_tier;
  }

  get premiumSubscriptionCount(): number | null {
    return this.entity.premium_subscription_count ?? null;
  }

  get preferredLocale(): Locale {
    return this.entity.preferred_locale;
  }

  get publicUpdatesChannelId(): Snowflake | null {
    return this.entity.public_updates_channel_id ?? null;
  }

  get maxVideoChannelUsers(): number | null {
    return this.entity.max_video_channel_users ?? null;
  }

  get maxStageVideoChannelUsers(): number | null {
    return this.entity.max_stage_video_channel_users ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.entity.approximate_member_count ?? null;
  }

  get approximatePresenceCount(): number | null {
    return this.entity.approximate_presence_count ?? null;
  }

  get welcomeScreen(): WelcomeScreen | null {
    return this.entity.welcome_screen
      ? new WelcomeScreen(this.client, this.entity.welcome_screen)
      : null;
  }

  get nsfwLevel(): NsfwLevel {
    return this.entity.nsfw_level;
  }

  get stickers(): Sticker[] | null {
    return this.entity.stickers
      ? this.entity.stickers.map((sticker) => new Sticker(this.client, sticker))
      : null;
  }

  get premiumProgressBarEnabled(): boolean {
    return Boolean(this.entity.premium_progress_bar_enabled);
  }

  get safetyAlertsChannelId(): Snowflake | null {
    return this.entity.safety_alerts_channel_id ?? null;
  }

  get joinedAt(): string {
    return this.entity.joined_at;
  }

  get large(): boolean {
    return Boolean(this.entity.large);
  }

  get unavailable(): boolean {
    return Boolean(this.entity.unavailable);
  }

  get memberCount(): number {
    return this.entity.member_count;
  }

  get voiceStates(): VoiceState[] {
    return Array.isArray(this.entity.voice_states)
      ? this.entity.voice_states.map(
          (voiceState) => new VoiceState(this.client, voiceState),
        )
      : [];
  }

  get members(): GuildMember[] {
    return Array.isArray(this.entity.members)
      ? this.entity.members.map(
          (member) => new GuildMember(this.client, member),
        )
      : [];
  }

  get channels(): Channel[] {
    return Array.isArray(this.entity.channels)
      ? this.entity.channels.map((channel) => new Channel(this.client, channel))
      : [];
  }

  get threads(): AnyThreadChannel[] {
    return Array.isArray(this.entity.threads)
      ? this.entity.threads.map((thread) =>
          resolveThreadChannel(this.client, thread),
        )
      : [];
  }

  get presences(): object[] {
    return Array.isArray(this.entity.presences)
      ? [...this.entity.presences]
      : [];
  }

  get stageInstances(): StageInstance[] {
    return Array.isArray(this.entity.stage_instances)
      ? this.entity.stage_instances.map(
          (stageInstance) => new StageInstance(this.client, stageInstance),
        )
      : [];
  }

  get guildScheduledEvents(): GuildScheduledEvent[] {
    return Array.isArray(this.entity.guild_scheduled_events)
      ? this.entity.guild_scheduled_events.map(
          (guildScheduledEvent) =>
            new GuildScheduledEvent(this.client, guildScheduledEvent),
        )
      : [];
  }

  get soundboardSounds(): SoundboardSound[] {
    return Array.isArray(this.entity.soundboard_sounds)
      ? this.entity.soundboard_sounds.map(
          (soundboardSound) =>
            new SoundboardSound(this.client, soundboardSound),
        )
      : [];
  }

  toJson(): GuildCreateEntity {
    return { ...this.entity };
  }
}

export const GuildSchema = z.instanceof(Guild);
