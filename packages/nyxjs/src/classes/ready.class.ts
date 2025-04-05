import type {
  ApiVersion,
  ApplicationEntity,
  UnavailableGuildEntity,
} from "@nyxjs/core";
import type { ReadyEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a READY event dispatched when a client has completed the initial handshake with the gateway.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready}
 */
export class Ready extends BaseClass<ReadyEntity> {
  /**
   * API version
   */
  get v(): ApiVersion {
    return this.data.v;
  }

  /**
   * Information about the user including email
   */
  get user(): User {
    return User.from(this.client, this.data.user);
  }

  /**
   * Guilds the user is in
   */
  get guilds(): UnavailableGuildEntity[] {
    return this.data.guilds || [];
  }

  /**
   * Used for resuming connections
   */
  get sessionId(): string {
    return this.data.session_id;
  }

  /**
   * Gateway URL for resuming connections
   */
  get resumeGatewayUrl(): string {
    return this.data.resume_gateway_url;
  }

  /**
   * Shard information associated with this session, if sent when identifying
   */
  get shard(): [number, number] | null {
    return this.data.shard || null;
  }

  /**
   * Contains id and flags
   */
  get application(): Pick<ApplicationEntity, "id" | "flags"> {
    return this.data.application;
  }
}
