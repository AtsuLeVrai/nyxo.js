import { BitFieldManager, type Snowflake } from "@nyxjs/core";
import { ThreadMemberUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class ThreadMember extends BaseClass<ThreadMemberUpdateEntity> {
  readonly #flags: BitFieldManager<number>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof ThreadMemberUpdateEntity>> = {},
  ) {
    super(client, ThreadMemberUpdateEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake | null {
    return this.entity.id ?? null;
  }

  get userId(): Snowflake | null {
    return this.entity.user_id ?? null;
  }

  get joinTimestamp(): string {
    return this.entity.join_timestamp;
  }

  get flags(): BitFieldManager<number> {
    return this.#flags;
  }

  get member(): GuildMember {
    return new GuildMember(this.client, this.entity.member);
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  toJson(): ThreadMemberUpdateEntity {
    return { ...this.entity };
  }
}

export const ThreadMemberSchema = z.instanceof(ThreadMember);
