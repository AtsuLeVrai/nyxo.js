import type { Snowflake } from "@nyxjs/core";
import { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class VoiceServer extends BaseClass<VoiceServerUpdateEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof VoiceServerUpdateEntity>> = {},
  ) {
    super(client, VoiceServerUpdateEntity, entity);
  }

  get token(): string {
    return this.entity.token;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get endpoint(): string | null {
    return this.entity.endpoint ?? null;
  }

  toJson(): VoiceServerUpdateEntity {
    return { ...this.entity };
  }
}

export const VoiceServerSchema = z.instanceof(VoiceServer);
