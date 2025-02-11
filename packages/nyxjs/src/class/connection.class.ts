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
    data: Partial<z.input<typeof ConnectionEntity>> = {},
  ) {
    super(client, ConnectionEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get type(): ConnectionService {
    return this.data.type;
  }

  get revoked(): boolean {
    return Boolean(this.data.revoked);
  }

  get integrations(): Integration[] | null {
    return this.data.integrations
      ? this.data.integrations.map(
          (integration) => new Integration(this.client, integration),
        )
      : null;
  }

  get verified(): boolean {
    return Boolean(this.data.verified);
  }

  get friendSync(): boolean {
    return Boolean(this.data.friend_sync);
  }

  get showActivity(): boolean {
    return Boolean(this.data.show_activity);
  }

  get twoWayLink(): boolean {
    return Boolean(this.data.two_way_link);
  }

  get visibility(): number {
    return this.data.visibility;
  }

  toJson(): ConnectionEntity {
    return { ...this.data };
  }
}

export const ConnectionSchema = z.instanceof(Connection);
