import type { ApiVersion, Integer } from "@nyxjs/core";
import type { GatewayIntentsBits, GatewayOpcodes } from "../enums/index.js";
import type { UpdatePresenceEntity } from "../events/index.js";
import type { RateLimitOptions } from "./rate-limit.type.js";
import type { ShardOptions } from "./shard.type.js";

export enum CompressionType {
  ZlibStream = "zlib-stream",
  ZstdStream = "zstd-stream",
}

export enum EncodingType {
  Json = "json",
  Etf = "etf",
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#connecting-gateway-url-query-string-params}
 */
export interface GatewayQueryEntity {
  v: ApiVersion.V10;
  encoding: EncodingType;
  compress: CompressionType | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: Integer | null;
  t: string | null;
}

export interface GatewayOptions extends ShardOptions, RateLimitOptions {
  token: string;
  version: ApiVersion.V10;
  compress?: CompressionType;
  encoding?: EncodingType;
  intents: GatewayIntentsBits[];
  largeThreshold?: Integer;
  presence?: UpdatePresenceEntity;
}
