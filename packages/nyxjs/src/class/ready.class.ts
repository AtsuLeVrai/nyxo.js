import type { ApiVersion } from "@nyxjs/core";
import { ReadyEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Application } from "./application.class.js";
import { UnavailableGuild } from "./unavailable-guild.class.js";
import { User } from "./user.class.js";

export class Ready extends BaseClass<ReadyEntity> {
  constructor(client: Client, data: Partial<z.input<typeof ReadyEntity>> = {}) {
    super(client, ReadyEntity as z.ZodSchema, data);
  }

  get v(): ApiVersion {
    return this.data.v;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get guilds(): UnavailableGuild[] {
    return Array.isArray(this.data.guilds)
      ? this.data.guilds.map(
          (guild) => new UnavailableGuild(this.client, guild),
        )
      : [];
  }

  get sessionId(): string {
    return this.data.session_id;
  }

  get resumeGatewayUrl(): string {
    return this.data.resume_gateway_url;
  }

  get shard(): [number, number] | null {
    return this.data.shard ?? null;
  }

  get application(): Application | null {
    return this.data.application
      ? new Application(this.client, this.data.application)
      : null;
  }

  toJson(): ReadyEntity {
    return { ...this.data };
  }
}

export const ReadySchema = z.instanceof(Ready);
