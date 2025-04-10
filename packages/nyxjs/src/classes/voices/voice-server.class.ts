import type { Snowflake } from "@nyxjs/core";
import type { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class VoiceServer
  extends BaseClass<VoiceServerUpdateEntity>
  implements EnforceCamelCase<VoiceServerUpdateEntity>
{
  get token(): string {
    return this.data.token;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get endpoint(): string | null {
    return this.data.endpoint;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "voiceServers",
      id: this.guildId,
    };
  }
}
