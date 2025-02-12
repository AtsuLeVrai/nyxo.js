import {
  ConnectionEntity,
  type ConnectionService,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Integration } from "./integration.class.js";

export class Connection extends BaseClass<ConnectionEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ConnectionEntity>> = {},
  ) {
    super(client, ConnectionEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get type(): ConnectionService {
    return this.entity.type;
  }

  get revoked(): boolean {
    return Boolean(this.entity.revoked);
  }

  get integrations(): Integration[] | null {
    return this.entity.integrations
      ? this.entity.integrations.map(
          (integration) => new Integration(this.client, integration),
        )
      : null;
  }

  get verified(): boolean {
    return Boolean(this.entity.verified);
  }

  get friendSync(): boolean {
    return Boolean(this.entity.friend_sync);
  }

  get showActivity(): boolean {
    return Boolean(this.entity.show_activity);
  }

  get twoWayLink(): boolean {
    return Boolean(this.entity.two_way_link);
  }

  get visibility(): number {
    return this.entity.visibility;
  }

  toJson(): ConnectionEntity {
    return { ...this.entity };
  }
}

export const ConnectionSchema = z.instanceof(Connection);
