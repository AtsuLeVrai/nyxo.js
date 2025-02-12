import type { ApiVersion } from "@nyxjs/core";
import { ReadyEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Application } from "./application.class.js";
import { UnavailableGuild } from "./unavailable-guild.class.js";
import { User } from "./user.class.js";

export class Ready extends BaseClass<ReadyEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ReadyEntity>> = {},
  ) {
    super(client, ReadyEntity as z.ZodSchema, entity);
  }

  get v(): ApiVersion {
    return this.entity.v;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get guilds(): UnavailableGuild[] {
    return Array.isArray(this.entity.guilds)
      ? this.entity.guilds.map(
          (guild) => new UnavailableGuild(this.client, guild),
        )
      : [];
  }

  get sessionId(): string {
    return this.entity.session_id;
  }

  get resumeGatewayUrl(): string {
    return this.entity.resume_gateway_url;
  }

  get shard(): [number, number] | null {
    return this.entity.shard ?? null;
  }

  get application(): Application | null {
    return this.entity.application
      ? new Application(this.client, this.entity.application)
      : null;
  }

  toJson(): ReadyEntity {
    return { ...this.entity };
  }
}

export const ReadySchema = z.instanceof(Ready);
