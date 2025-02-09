import { GuildCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class Guild {
  readonly #data: GuildCreateEntity;

  constructor(data: GuildCreateEntity) {
    this.#data = GuildCreateEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get iconHash(): string | null {
    return this.#data.icon_hash ?? null;
  }

  get splash(): string | null {
    return this.#data.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.#data.discovery_splash ?? null;
  }

  get owner(): boolean | null {
    return this.#data.owner ?? null;
  }

  get ownerId(): unknown {
    return this.#data.owner_id;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get region(): string | null {
    return this.#data.region ?? null;
  }

  get afkChannelId(): unknown | null {
    return this.#data.afk_channel_id ?? null;
  }

  get afkTimeout(): number {
    return this.#data.afk_timeout;
  }

  get widgetEnabled(): boolean | null {
    return this.#data.widget_enabled ?? null;
  }

  get widgetChannelId(): string | null {
    return this.#data.widget_channel_id ?? null;
  }

  get verificationLevel(): unknown {
    return this.#data.verification_level;
  }

  get defaultMessageNotifications(): unknown {
    return this.#data.default_message_notifications;
  }

  get explicitContentFilter(): unknown {
    return this.#data.explicit_content_filter;
  }

  get roles(): object[] {
    return Array.isArray(this.#data.roles) ? [...this.#data.roles] : [];
  }

  get emojis(): unknown[] {
    return Array.isArray(this.#data.emojis) ? [...this.#data.emojis] : [];
  }

  get features(): unknown[] {
    return Array.isArray(this.#data.features) ? [...this.#data.features] : [];
  }

  get mfaLevel(): unknown {
    return this.#data.mfa_level;
  }

  get applicationId(): unknown | null {
    return this.#data.application_id ?? null;
  }

  get systemChannelId(): unknown | null {
    return this.#data.system_channel_id ?? null;
  }

  get systemChannelFlags(): unknown {
    return this.#data.system_channel_flags;
  }

  get rulesChannelId(): unknown | null {
    return this.#data.rules_channel_id ?? null;
  }

  get maxPresences(): number | null {
    return this.#data.max_presences ?? null;
  }

  get maxMembers(): number {
    return this.#data.max_members;
  }

  get vanityUrlCode(): string | null {
    return this.#data.vanity_url_code ?? null;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get banner(): string | null {
    return this.#data.banner ?? null;
  }

  get premiumTier(): unknown {
    return this.#data.premium_tier;
  }

  get premiumSubscriptionCount(): number | null {
    return this.#data.premium_subscription_count ?? null;
  }

  get preferredLocale(): unknown {
    return this.#data.preferred_locale;
  }

  get publicUpdatesChannelId(): unknown | null {
    return this.#data.public_updates_channel_id ?? null;
  }

  get maxVideoChannelUsers(): number | null {
    return this.#data.max_video_channel_users ?? null;
  }

  get maxStageVideoChannelUsers(): number | null {
    return this.#data.max_stage_video_channel_users ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.#data.approximate_member_count ?? null;
  }

  get approximatePresenceCount(): number | null {
    return this.#data.approximate_presence_count ?? null;
  }

  get welcomeScreen(): object | null {
    return this.#data.welcome_screen ?? null;
  }

  get nsfwLevel(): unknown {
    return this.#data.nsfw_level;
  }

  get stickers(): unknown[] | null {
    return this.#data.stickers ?? null;
  }

  get premiumProgressBarEnabled(): boolean {
    return Boolean(this.#data.premium_progress_bar_enabled);
  }

  get safetyAlertsChannelId(): unknown | null {
    return this.#data.safety_alerts_channel_id ?? null;
  }

  get joinedAt(): string {
    return this.#data.joined_at;
  }

  get large(): boolean {
    return Boolean(this.#data.large);
  }

  get unavailable(): boolean | null {
    return this.#data.unavailable ?? null;
  }

  get memberCount(): number {
    return this.#data.member_count;
  }

  get voiceStates(): object[] {
    return Array.isArray(this.#data.voice_states)
      ? [...this.#data.voice_states]
      : [];
  }

  get members(): object[] {
    return Array.isArray(this.#data.members) ? [...this.#data.members] : [];
  }

  get channels(): unknown[] {
    return Array.isArray(this.#data.channels) ? [...this.#data.channels] : [];
  }

  get threads(): unknown[] {
    return Array.isArray(this.#data.threads) ? [...this.#data.threads] : [];
  }

  get presences(): object[] {
    return Array.isArray(this.#data.presences) ? [...this.#data.presences] : [];
  }

  get stageInstances(): object[] {
    return Array.isArray(this.#data.stage_instances)
      ? [...this.#data.stage_instances]
      : [];
  }

  get guildScheduledEvents(): object[] {
    return Array.isArray(this.#data.guild_scheduled_events)
      ? [...this.#data.guild_scheduled_events]
      : [];
  }

  get soundboardSounds(): object[] {
    return Array.isArray(this.#data.soundboard_sounds)
      ? [...this.#data.soundboard_sounds]
      : [];
  }

  static fromJson(json: GuildCreateEntity): Guild {
    return new Guild(json);
  }

  toJson(): GuildCreateEntity {
    return { ...this.#data };
  }

  clone(): Guild {
    return new Guild(this.toJson());
  }

  validate(): boolean {
    try {
      GuildSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildCreateEntity>): Guild {
    return new Guild({ ...this.toJson(), ...other });
  }

  equals(other: Guild): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildSchema = z.instanceof(Guild);
