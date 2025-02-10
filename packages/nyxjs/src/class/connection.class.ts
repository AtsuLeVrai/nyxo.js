import {
  ConnectionEntity,
  type ConnectionService,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Integration } from "./integration.class.js";

export class Connection {
  readonly #data: ConnectionEntity;

  constructor(data: Partial<z.input<typeof ConnectionEntity>> = {}) {
    try {
      this.#data = ConnectionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get type(): ConnectionService {
    return this.#data.type;
  }

  get revoked(): boolean {
    return Boolean(this.#data.revoked);
  }

  get integrations(): Integration[] | null {
    return this.#data.integrations
      ? this.#data.integrations.map(
          (integration) => new Integration(integration),
        )
      : null;
  }

  get verified(): boolean {
    return Boolean(this.#data.verified);
  }

  get friendSync(): boolean {
    return Boolean(this.#data.friend_sync);
  }

  get showActivity(): boolean {
    return Boolean(this.#data.show_activity);
  }

  get twoWayLink(): boolean {
    return Boolean(this.#data.two_way_link);
  }

  get visibility(): number {
    return this.#data.visibility;
  }

  toJson(): ConnectionEntity {
    return { ...this.#data };
  }

  clone(): Connection {
    return new Connection(this.toJson());
  }

  validate(): boolean {
    try {
      ConnectionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ConnectionEntity>): Connection {
    return new Connection({ ...this.toJson(), ...other });
  }

  equals(other: Connection): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ConnectionSchema = z.instanceof(Connection);
