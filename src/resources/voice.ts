import { BaseClass } from "../bases/index.js";
import type { CamelCaseKeys } from "../utils/index.js";

export enum VoiceChannelEffectSendAnimationType {
  Premium = 0,
  Basic = 1,
}

export interface VoiceRegionEntity {
  id: string;
  name: string;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

export interface VoiceStateEntity {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  member?: GuildMemberEntity;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string | null;
}

export interface GatewayVoiceServerUpdateEntity {
  token: string;
  guild_id: string;
  endpoint: string | null;
}

export interface GatewayVoiceChannelEffectSendEntity
  extends Required<DeepNonNullable<Pick<VoiceStateEntity, "channel_id" | "guild_id" | "user_id">>> {
  emoji?: EmojiEntity | null;
  animation_type?: VoiceChannelEffectSendAnimationType;
  animation_id?: number;
  sound_id?: string | number;
  sound_volume?: number;
}

export type RESTModifyCurrentUserVoiceStateJSONParams = Partial<
  Pick<VoiceStateEntity, "channel_id" | "suppress" | "request_to_speak_timestamp">
>;

export type RESTModifyUserVoiceStateJSONParams = Omit<
  RESTModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;

export const VoiceRoutes = {
  listVoiceRegions: () => "/voice/regions",
  getCurrentUserVoiceState: (guildId: string) => `/guilds/${guildId}/voice-states/@me` as const,
  getUserVoiceState: (guildId: string, userId: string) =>
    `/guilds/${guildId}/voice-states/${userId}` as const,
} as const satisfies RouteBuilder;

export class VoiceRouter extends BaseRouter {
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.rest.get(VoiceRoutes.listVoiceRegions());
  }

  getCurrentUserVoiceState(guildId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getCurrentUserVoiceState(guildId));
  }

  getUserVoiceState(guildId: string, userId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getUserVoiceState(guildId, userId));
  }

  modifyCurrentUserVoiceState(
    guildId: string,
    options: RESTModifyCurrentUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getCurrentUserVoiceState(guildId), {
      body: JSON.stringify(options),
    });
  }

  modifyUserVoiceState(
    guildId: string,
    userId: string,
    options: RESTModifyUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getUserVoiceState(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}

export class VoiceRegion
  extends BaseClass<VoiceRegionEntity>
  implements CamelCaseKeys<VoiceRegionEntity>
{
  readonly custom = this.rawData.custom;
  readonly deprecated = this.rawData.deprecated;
  readonly id = this.rawData.id;
  readonly name = this.rawData.name;
  readonly optimal = this.rawData.optimal;
}

export class VoiceState
  extends BaseClass<VoiceStateEntity>
  implements CamelCaseKeys<VoiceStateEntity>
{
  readonly guildId = this.rawData.guild_id;
  readonly channelId = this.rawData.channel_id;
  readonly userId = this.rawData.user_id;
  readonly member = this.rawData.member;
  readonly sessionId = this.rawData.session_id;
  readonly deaf = this.rawData.deaf;
  readonly mute = this.rawData.mute;
  readonly selfDeaf = this.rawData.self_deaf;
  readonly selfMute = this.rawData.self_mute;
  readonly selfStream = Boolean(this.rawData.self_stream);
  readonly selfVideo = this.rawData.self_video;
  readonly suppress = this.rawData.suppress;
  readonly requestToSpeakTimestamp = this.rawData.request_to_speak_timestamp;
}
