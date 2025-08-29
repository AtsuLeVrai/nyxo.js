import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { VoiceRegionEntity, VoiceStateEntity } from "./voice.entity.js";

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
