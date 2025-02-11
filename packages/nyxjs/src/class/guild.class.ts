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
    data: Partial<z.input<typeof GuildCreateEntity>> = {},
  ) {
    super(client, GuildCreateEntity, data);
    this.#systemChannelFlags = new BitFieldManager(
      this.data.system_channel_flags,
    );
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get iconHash(): string | null {
    return this.data.icon_hash ?? null;
  }

  get splash(): string | null {
    return this.data.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.data.discovery_splash ?? null;
  }

  get owner(): boolean {
    return Boolean(this.data.owner);
  }

  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get region(): string | null {
    return this.data.region ?? null;
  }

  get afkChannelId(): Snowflake | null {
    return this.data.afk_channel_id ?? null;
  }

  get afkTimeout(): number {
    return this.data.afk_timeout;
  }

  get widgetEnabled(): boolean {
    return Boolean(this.data.widget_enabled);
  }

  get widgetChannelId(): string | null {
    return this.data.widget_channel_id ?? null;
  }

  get verificationLevel(): VerificationLevel {
    return this.data.verification_level;
  }

  get defaultMessageNotifications(): unknown {
    return this.data.default_message_notifications;
  }

  get explicitContentFilter(): ExplicitContentFilterLevel {
    return this.data.explicit_content_filter;
  }

  get roles(): Role[] {
    return Array.isArray(this.data.roles)
      ? this.data.roles.map((role) => new Role(this.client, role))
      : [];
  }

  get emojis(): Emoji[] {
    return Array.isArray(this.data.emojis)
      ? this.data.emojis.map((emoji) => new Emoji(this.client, emoji))
      : [];
  }

  get features(): (GuildFeature | string)[] {
    return Array.isArray(this.data.features) ? [...this.data.features] : [];
  }

  get mfaLevel(): MfaLevel {
    return this.data.mfa_level;
  }

  get applicationId(): Snowflake | null {
    return this.data.application_id ?? null;
  }

  get systemChannelId(): Snowflake | null {
    return this.data.system_channel_id ?? null;
  }

  get systemChannelFlags(): BitFieldManager<SystemChannelFlags> {
    return this.#systemChannelFlags;
  }

  get rulesChannelId(): Snowflake | null {
    return this.data.rules_channel_id ?? null;
  }

  get maxPresences(): number | null {
    return this.data.max_presences ?? null;
  }

  get maxMembers(): number {
    return this.data.max_members;
  }

  get vanityUrlCode(): string | null {
    return this.data.vanity_url_code ?? null;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get banner(): string | null {
    return this.data.banner ?? null;
  }

  get premiumTier(): PremiumTier {
    return this.data.premium_tier;
  }

  get premiumSubscriptionCount(): number | null {
    return this.data.premium_subscription_count ?? null;
  }

  get preferredLocale(): Locale {
    return this.data.preferred_locale;
  }

  get publicUpdatesChannelId(): Snowflake | null {
    return this.data.public_updates_channel_id ?? null;
  }

  get maxVideoChannelUsers(): number | null {
    return this.data.max_video_channel_users ?? null;
  }

  get maxStageVideoChannelUsers(): number | null {
    return this.data.max_stage_video_channel_users ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.data.approximate_member_count ?? null;
  }

  get approximatePresenceCount(): number | null {
    return this.data.approximate_presence_count ?? null;
  }

  get welcomeScreen(): WelcomeScreen | null {
    return this.data.welcome_screen
      ? new WelcomeScreen(this.client, this.data.welcome_screen)
      : null;
  }

  get nsfwLevel(): NsfwLevel {
    return this.data.nsfw_level;
  }

  get stickers(): Sticker[] | null {
    return this.data.stickers
      ? this.data.stickers.map((sticker) => new Sticker(this.client, sticker))
      : null;
  }

  get premiumProgressBarEnabled(): boolean {
    return Boolean(this.data.premium_progress_bar_enabled);
  }

  get safetyAlertsChannelId(): Snowflake | null {
    return this.data.safety_alerts_channel_id ?? null;
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

  get voiceStates(): VoiceState[] {
    return Array.isArray(this.data.voice_states)
      ? this.data.voice_states.map(
          (voiceState) => new VoiceState(this.client, voiceState),
        )
      : [];
  }

  get members(): GuildMember[] {
    return Array.isArray(this.data.members)
      ? this.data.members.map((member) => new GuildMember(this.client, member))
      : [];
  }

  get channels(): Channel[] {
    return Array.isArray(this.data.channels)
      ? this.data.channels.map((channel) => new Channel(this.client, channel))
      : [];
  }

  get threads(): AnyThreadChannel[] {
    return Array.isArray(this.data.threads)
      ? this.data.threads.map((thread) =>
          resolveThreadChannel(this.client, thread),
        )
      : [];
  }

  get presences(): object[] {
    return Array.isArray(this.data.presences) ? [...this.data.presences] : [];
  }

  get stageInstances(): StageInstance[] {
    return Array.isArray(this.data.stage_instances)
      ? this.data.stage_instances.map(
          (stageInstance) => new StageInstance(this.client, stageInstance),
        )
      : [];
  }

  get guildScheduledEvents(): GuildScheduledEvent[] {
    return Array.isArray(this.data.guild_scheduled_events)
      ? this.data.guild_scheduled_events.map(
          (guildScheduledEvent) =>
            new GuildScheduledEvent(this.client, guildScheduledEvent),
        )
      : [];
  }

  get soundboardSounds(): SoundboardSound[] {
    return Array.isArray(this.data.soundboard_sounds)
      ? this.data.soundboard_sounds.map(
          (soundboardSound) =>
            new SoundboardSound(this.client, soundboardSound),
        )
      : [];
  }

  toJson(): GuildCreateEntity {
    return { ...this.data };
  }
}

export const GuildSchema = z.instanceof(Guild);
