import type { ApplicationEntity, GuildEntity } from "@nyxojs/core";
import type { ReadyEntity } from "@nyxojs/gateway";
import { BaseClass } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { Application } from "./application.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

/**
 * Represents the Ready event emitted by Discord when a client has completed the initial handshake.
 *
 * The Ready class encapsulates the state transmitted when a client connects to Discord's Gateway,
 * providing access to:
 * - The authenticated user's information
 * - API version information
 * - Available guilds (initially marked as unavailable)
 * - Session data required for resuming disconnected sessions
 * - Application and shard information
 *
 * This class is typically created and emitted once upon successful connection to the Gateway,
 * and serves as the entry point for accessing the Discord client's initial state.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready}
 */
export class Ready
  extends BaseClass<ReadyEntity>
  implements Enforce<PropsToCamel<ReadyEntity>>
{
  /**
   * Gets the current API version being used.
   *
   * This indicates which version of the Discord API the gateway connection is using.
   * Useful for debugging version-related issues and tracking API version transitions.
   *
   * @returns The API version
   */
  readonly v = this.rawData.v;

  /**
   * Gets information about the authenticated user.
   *
   * This contains the complete user object for the client's authenticated account,
   * including email if the client has the email OAuth2 scope.
   *
   * @returns The User object representing the authenticated client
   */
  readonly user = new User(this.client, this.rawData.user);

  /**
   * Gets an array of unavailable guilds that the authenticated user is a member of.
   *
   * These guilds are initially marked as unavailable and will become available
   * through subsequent Guild Create events as data is received from Discord.
   *
   * @returns Array of unavailable guild objects
   */
  readonly guilds = this.rawData.guilds.map(
    (guild) => new Guild(this.client, guild as unknown as GuildEntity),
  );

  /**
   * Gets the session ID for this connection.
   *
   * This ID is crucial for resuming a disconnected session and should be
   * stored if you intend to implement reconnection logic.
   *
   * @returns The session ID as a string
   */
  readonly sessionId = this.rawData.session_id;

  /**
   * Gets the gateway URL to use for resuming connections.
   *
   * If the client gets disconnected, this URL should be used to reconnect
   * instead of the original gateway URL.
   *
   * @returns The resume gateway URL as a string
   */
  readonly resumeGatewayUrl = this.rawData.resume_gateway_url;

  /**
   * Gets shard information for this session, if applicable.
   *
   * This is only present if the client identified with sharding information.
   * Returns a two-element array containing [shardId, numShards].
   *
   * @returns The shard information array, or undefined if not sharded
   */
  readonly shard = this.rawData.shard;

  /**
   * Gets information about the application associated with this client.
   *
   * This contains a partial application object with application ID and flags.
   *
   * @returns The Application object
   */
  readonly application = new Application(
    this.client,
    this.rawData.application as ApplicationEntity,
  );

  /**
   * The number of guilds the client is connected to.
   *
   * This is initially the number of unavailable guilds, as guilds become
   * available gradually after the Ready event.
   *
   * @returns The guild count
   */
  readonly guildCount = this.guilds.length;

  /**
   * Gets the shard ID if the client is sharded.
   *
   * @returns The shard ID, or -1 if not sharded
   */
  get shardId(): number {
    return this.shard ? this.shard[0] : -1;
  }

  /**
   * Gets the total number of shards if the client is sharded.
   *
   * @returns The total number of shards, or 0 if not sharded
   */
  get totalShards(): number {
    return this.shard ? this.shard[1] : 0;
  }
}
