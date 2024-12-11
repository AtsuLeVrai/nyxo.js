import type { ApiVersion } from "@nyxjs/core";
import type { Dispatcher, Pool, ProxyAgent, RetryHandler } from "undici";
import type {
  ApplicationCommandRouter,
  ApplicationConnectionRouter,
  ApplicationRouter,
  AuditLogRouter,
  AutoModerationRouter,
  ChannelRouter,
  EmojiRouter,
  EntitlementRouter,
  GatewayRouter,
  GuildRouter,
  GuildTemplateRouter,
  InteractionRouter,
  InviteRouter,
  MessageRouter,
  OAuth2Router,
  PollRouter,
  ScheduledEventRouter,
  SkuRouter,
  SoundboardRouter,
  StageInstanceRouter,
  StickerRouter,
  SubscriptionRouter,
  UserRouter,
  VoiceRouter,
  WebhookRouter,
} from "../routes/index.js";
import type {
  AuthTypeFlag,
  HttpMethodFlag,
  JsonErrorCode,
} from "../utils/index.js";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-data}
 */
export type ImageData =
  `data:image/${"jpeg" | "png" | "webp"};base64,${string}`;
export type PathLike = `/${string}`;
export type FileEntity = File | string;
export type DiscordUserAgent = `DiscordBot (${string}, ${string})`;
export type RateLimitScope = "user" | "global" | "shared";

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export interface RateLimitResponseEntity {
  message: string;
  retry_after: number;
  global: boolean;
  code?: JsonErrorCode;
}

export interface JsonErrorEntity {
  code: number;
  message: string;
  errors?: Record<string, unknown>;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-example-json-error-response}
 */
export interface JsonErrorResponseEntity {
  code: JsonErrorCode;
  message: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#header-format-rate-limit-header-examples}
 */
export interface RateLimitEntity {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  global: boolean;
  scope: RateLimitScope;
}

export interface RouteEntity
  extends Omit<
    Dispatcher.RequestOptions,
    "origin" | "path" | "method" | "headers"
  > {
  method: HttpMethodFlag;
  path: PathLike;
  headers?: Record<string, string>;
  files?: FileEntity | FileEntity[];
  reason?: string;
}

export interface RestOptionsEntity {
  token: string;
  version?: ApiVersion.V10;
  /**
   * @default {@link AuthTypeFlag.Bot}
   */
  authType?: AuthTypeFlag;
  userAgent?: DiscordUserAgent;
  compress?: boolean;
  maxRetries?: number;
  baseRetryDelay?: number;
  timeout?: number;
  rateLimitRetryLimit?: number;
  maxConcurrentRequests?: number;
  proxy?: ProxyAgent.Options;
  pool?: Pool.Options;
  retry?: RetryHandler.RetryOptions;
}

export interface RestEventMap {
  debug: [message: string];
  warn: [message: string];
  error: [error: Error];
  apiRequest: [data: ApiRequest];
  rateLimitHit: [data: RateLimitHit];
  requestRetry: [data: RequestRetry];
  responseReceived: [data: ResponseReceived];
  proxyUpdate: [data: NonNullable<RestOptionsEntity["proxy"]> | null];
}

export interface ApiRequest {
  method: HttpMethodFlag;
  path: string;
  status: number;
  responseTime: number;
  attempt: number;
}

export interface RateLimitHit {
  bucket: string;
  resetAfter: number;
  limit: number;
  scope: RateLimitScope;
}

export interface RequestRetry {
  error: Error;
  attempt: number;
  maxAttempts: number;
}

export interface ResponseReceived {
  method: HttpMethodFlag;
  path: string;
  status: number;
  headers: Record<string, string | string[] | undefined>;
}

export type RouterDefinitions = {
  applications: ApplicationRouter;
  commands: ApplicationCommandRouter;
  connections: ApplicationConnectionRouter;
  auditLogs: AuditLogRouter;
  autoModeration: AutoModerationRouter;
  channels: ChannelRouter;
  emojis: EmojiRouter;
  entitlements: EntitlementRouter;
  gateway: GatewayRouter;
  guilds: GuildRouter;
  templates: GuildTemplateRouter;
  interactions: InteractionRouter;
  invites: InviteRouter;
  messages: MessageRouter;
  oauth2: OAuth2Router;
  polls: PollRouter;
  scheduledEvents: ScheduledEventRouter;
  skus: SkuRouter;
  soundboards: SoundboardRouter;
  stages: StageInstanceRouter;
  stickers: StickerRouter;
  subscriptions: SubscriptionRouter;
  users: UserRouter;
  voice: VoiceRouter;
  webhooks: WebhookRouter;
};

export type RouterKey = keyof RouterDefinitions;
