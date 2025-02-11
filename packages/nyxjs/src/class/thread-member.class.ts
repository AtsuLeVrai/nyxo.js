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
    data: Partial<z.input<typeof ThreadMemberUpdateEntity>> = {},
  ) {
    super(client, ThreadMemberUpdateEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake | null {
    return this.data.id ?? null;
  }

  get userId(): Snowflake | null {
    return this.data.user_id ?? null;
  }

  get joinTimestamp(): string {
    return this.data.join_timestamp;
  }

  get flags(): BitFieldManager<number> {
    return this.#flags;
  }

  get member(): GuildMember {
    return new GuildMember(this.client, this.data.member);
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  toJson(): ThreadMemberUpdateEntity {
    return { ...this.data };
  }
}

export const ThreadMemberSchema = z.instanceof(ThreadMember);
