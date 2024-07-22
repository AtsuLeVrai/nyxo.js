import type { Integer } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula}
 */
export function getShardId(guildId: Integer, numShards: Integer): number {
	return Number((BigInt(guildId) >> BigInt(22)) % BigInt(numShards));
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding-max-concurrency}
 */
export function getRateLimitKey(shardId: Integer, maxConcurrency: Integer): number {
	return shardId % maxConcurrency;
}
