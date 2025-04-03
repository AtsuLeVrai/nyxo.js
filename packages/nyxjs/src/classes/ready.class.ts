import {
  type ApiVersion,
  ApplicationFlags,
  BitFieldManager,
  type UnavailableGuildEntity,
} from "@nyxjs/core";
import type { ReadyEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents the Ready event received when connecting to Discord Gateway.
 * Contains initialization data about the bot, its application, and the environment.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready}
 */
export class Ready extends BaseClass<ReadyEntity> {
  /**
   * The Discord API version being used
   */
  get apiVersion(): ApiVersion {
    return this.data.v;
  }

  /**
   * The authenticated user (bot) information
   */
  get user(): User {
    return new User(this.client, this.data.user);
  }

  /**
   * The list of guilds the bot is in (initially shown as unavailable)
   */
  get guilds(): UnavailableGuildEntity[] {
    return this.data.guilds;
  }

  /**
   * The session ID for this connection (used for resuming)
   */
  get sessionId(): string {
    return this.data.session_id;
  }

  /**
   * The URL to use when resuming the connection
   */
  get resumeGatewayUrl(): string {
    return this.data.resume_gateway_url;
  }

  /**
   * The application ID of the bot
   */
  get applicationId(): string {
    return this.data.application.id;
  }

  /**
   * The application flags as a BitFieldManager
   */
  get applicationFlags(): BitFieldManager<ApplicationFlags> {
    return new BitFieldManager<ApplicationFlags>(
      BigInt(this.data.application.flags),
    );
  }

  /**
   * The shard information for this session if sharding is used
   * Returns [shardId, totalShards] or null if not sharded
   */
  get shard(): [shardId: number, totalShards: number] | null {
    return this.data.shard || null;
  }

  /**
   * Gets the total number of guilds the bot is in
   */
  get guildCount(): number {
    return this.data.guilds.length;
  }

  /**
   * Checks if the application has a specific flag
   *
   * @param flag - The flag to check for
   * @returns Whether the application has the flag
   */
  hasApplicationFlag(flag: bigint | ApplicationFlags): boolean {
    return this.applicationFlags.has(flag);
  }

  /**
   * Checks if the bot is running in sharded mode
   *
   * @returns Whether the bot is sharded
   */
  isSharded(): boolean {
    return this.data.shard !== undefined;
  }

  /**
   * Gets the shard ID for this session if sharding is used
   *
   * @returns The shard ID or null if not sharded
   */
  getShardId(): number | null {
    return this.data.shard ? this.data.shard[0] : null;
  }

  /**
   * Gets the total number of shards if sharding is used
   *
   * @returns The total number of shards or null if not sharded
   */
  getTotalShards(): number | null {
    return this.data.shard ? this.data.shard[1] : null;
  }

  /**
   * Checks if message content access is granted to the application
   *
   * @returns Whether the application has message content access
   */
  hasMessageContentAccess(): boolean {
    return this.hasApplicationFlag(ApplicationFlags.GatewayMessageContent);
  }

  /**
   * Checks if auto moderation access is granted to the application
   *
   * @returns Whether the application has auto moderation access
   */
  hasAutoModerationAccess(): boolean {
    return this.hasApplicationFlag(
      ApplicationFlags.ApplicationAutoModerationRuleCreateBadge,
    );
  }

  /**
   * Returns a string representation of this ready event
   *
   * @returns A string representation of this ready event
   */
  override toString(): string {
    return `Ready(User: ${this.user.username}, Guilds: ${this.guildCount})`;
  }
}
