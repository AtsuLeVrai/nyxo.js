import type { Snowflake } from "@nyxjs/core";
import { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class VoiceServer extends BaseClass<VoiceServerUpdateEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof VoiceServerUpdateEntity>> = {},
  ) {
    super(client, VoiceServerUpdateEntity, data);
  }

  get token(): string {
    return this.data.token;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get endpoint(): string | null {
    return this.data.endpoint ?? null;
  }

  toJson(): VoiceServerUpdateEntity {
    return { ...this.data };
  }
}

export const VoiceServerSchema = z.instanceof(VoiceServer);
