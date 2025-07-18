import { ApiVersion } from "@nyxojs/core";
import { EventEmitter } from "eventemitter3";
import { Pool } from "undici";
import { z } from "zod/v4";
import { FileHandler, FileHandlerOptions } from "../handlers/index.js";
import {
  RateLimitManager,
  RateLimitOptions,
  RetryManager,
  RetryOptions,
} from "../managers/index.js";
import {
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
  LobbyRouter,
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
  HttpRequestOptions,
  HttpResponse,
  JsonErrorField,
  JsonErrorResponse,
  RestEvents,
} from "../types/index.js";

/**
 * Regular expression pattern for validating Discord bot user agents.
 * Discord requires a specific format for user agents making API requests
 * to ensure proper identification and tracking of bot applications.
 *
 * **Required Format**: `DiscordBot (URL, Version)`
 *
 * @example
 * ```typescript
 * // Valid user agent strings
 * "DiscordBot (https://github.com/example/bot, 1.0.0)"
 * "DiscordBot (https://mybot.example.com, 2.3.1-beta)"
 * "DiscordBot (https://discord.gg/mybotserver, 1.0.0)"
 * ```
 *
 * @remarks Discord uses this information for:
 * - **Monitoring**: Tracking bot behavior and usage patterns
 * - **Support**: Identifying bots in support requests
 * - **Analytics**: Understanding API usage by application
 * - **Rate limiting**: Applying appropriate limits per bot
 *
 * @see {@link https://discord.com/developers/docs/reference#user-agent Discord User Agent Documentation}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

/**
 * Configuration schema for the Undici HTTP connection pool.
 * Controls HTTP connection behavior, performance characteristics,
 * and resource management for optimal Discord API communication.
 *
 * @remarks Pool configuration significantly impacts:
 * - **Performance**: Connection reuse reduces latency
 * - **Memory usage**: Too many connections consume resources
 * - **Reliability**: Proper timeouts prevent hanging requests
 * - **Throughput**: Connection limits control concurrency
 */
export const PoolOptions = z.object({
  /**
   * Maximum number of persistent connections per origin.
   * Controls connection pool size for optimal resource utilization.
   * Higher values enable more concurrent requests but increase memory usage.
   *
   * @default 10
   *
   * @remarks Recommended values by use case:
   * - **Small bots**: 5-10 connections (sufficient for most operations)
   * - **Medium bots**: 10-20 connections (handles moderate load)
   * - **Large bots**: 20-50 connections (high-throughput requirements)
   * - **Enterprise**: 50+ connections (maximum concurrency)
   *
   * @example
   * ```typescript
   * // Small bot configuration
   * const smallBot = { connections: 5 };
   *
   * // High-throughput bot configuration
   * const enterpriseBot = { connections: 50 };
   * ```
   */
  connections: z.number().int().positive().default(10),

  /**
   * Maximum number of requests to pipeline per connection.
   * HTTP/1.1 pipelining optimization - set to 1 to disable for compatibility.
   * Most Discord API endpoints work better without pipelining.
   *
   * @default 1 (pipelining disabled)
   *
   * @remarks Pipelining considerations:
   * - **Compatibility**: Discord API doesn't require pipelining
   * - **Debugging**: Easier to trace individual requests when disabled
   * - **Reliability**: Less complex error handling with single requests
   * - **Performance**: Minimal benefit for typical Discord bot workflows
   */
  pipelining: z.number().int().min(0).default(1),

  /**
   * Timeout for idle connections in milliseconds.
   * Controls how long connections remain open without activity.
   * Balances connection reuse efficiency with resource conservation.
   *
   * @default 30000 (30 seconds)
   *
   * @remarks Timeout strategy:
   * - **Too short**: Excessive connection establishment overhead
   * - **Too long**: Unnecessary resource consumption
   * - **Discord pattern**: Most bot activity occurs in bursts
   * - **Network reliability**: Accounts for connection state tracking
   */
  keepAliveTimeout: z.number().int().min(1).default(30000),

  /**
   * Maximum timeout ceiling for idle connections in milliseconds.
   * Upper bound for keep-alive timeout negotiation with the server.
   * Prevents excessive connection retention beyond reasonable limits.
   *
   * @default 600000 (10 minutes)
   *
   * @remarks This value represents the absolute maximum time a connection
   * can remain idle before forced closure, regardless of server preferences.
   */
  keepAliveMaxTimeout: z.number().int().min(1).default(600000),

  /**
   * Maximum size allowed for HTTP response headers in bytes.
   * Prevents memory exhaustion from malformed or abnormally large headers.
   * Discord API typically uses standard header sizes well below this limit.
   *
   * @default 16384 (16KB)
   *
   * @remarks Security considerations:
   * - **Memory protection**: Prevents header-based DoS attacks
   * - **Discord compliance**: Well above normal Discord header sizes
   * - **Error detection**: Catches malformed responses early
   * - **Resource management**: Bounds memory allocation per request
   */
  maxHeaderSize: z.number().int().min(1).default(16384),

  /**
   * Maximum number of HTTP redirections to follow automatically.
   * Discord API typically doesn't use redirects, so this is disabled by default.
   * Helps prevent redirect loops and maintains predictable request behavior.
   *
   * @default 0 (redirections disabled)
   *
   * @remarks Redirect policy:
   * - **Discord API**: Direct endpoint access without redirects
   * - **Security**: Prevents redirect-based attacks
   * - **Predictability**: Explicit control over request destinations
   * - **Debugging**: Clearer request tracing without redirect chains
   */
  maxRedirections: z.number().int().min(0).default(0),

  /**
   * Maximum number of concurrent requests per client instance.
   * Controls overall concurrency to prevent overwhelming Discord's servers
   * and maintain compliance with API rate limits.
   *
   * @default 10
   *
   * @remarks Concurrency balance:
   * - **Rate limit compliance**: Stays within Discord's global limits
   * - **Server courtesy**: Avoids excessive load on Discord infrastructure
   * - **Error handling**: Manageable number of simultaneous failures
   * - **Resource efficiency**: Balanced CPU and memory usage
   */
  maxRequestsPerClient: z.number().int().positive().default(10),

  /**
   * Maximum size allowed for response body content in bytes.
   * Protects against memory exhaustion from unexpectedly large responses.
   * Discord API responses are typically small, making this a safety net.
   *
   * @default 52428800 (50MB)
   *
   * @remarks Size considerations:
   * - **File uploads**: Accommodates large file download responses
   * - **Memory safety**: Prevents unbounded memory allocation
   * - **Typical usage**: Most Discord responses are under 1MB
   * - **Edge cases**: Handles large guild member lists or message histories
   */
  maxResponseSize: z
    .number()
    .int()
    .default(50 * 1024 * 1024),

  /**
   * Connection establishment timeout in milliseconds.
   * Time limit for initial TCP connection setup to Discord's servers.
   * Separate from overall request timeout for granular control.
   *
   * @default 30000 (30 seconds)
   *
   * @remarks Connection timing:
   * - **Network conditions**: Accommodates various network speeds
   * - **Geographic diversity**: Accounts for global Discord infrastructure
   * - **Reliability**: Detects connection issues early
   * - **User experience**: Reasonable wait time for users
   */
  connectTimeout: z.number().int().positive().default(30000),

  /**
   * Response headers arrival timeout in milliseconds.
   * Time limit for receiving HTTP response headers after request sent.
   * Helps identify server-side processing delays or network issues.
   *
   * @default 30000 (30 seconds)
   *
   * @remarks Header timing significance:
   * - **Server health**: Indicates Discord API responsiveness
   * - **Network quality**: Reflects connection stability
   * - **Error detection**: Catches stuck requests early
   * - **Performance monitoring**: Tracks API response patterns
   */
  headersTimeout: z.number().int().positive().default(30000),

  /**
   * Response body completion timeout in milliseconds.
   * Time limit for receiving complete response body after headers arrive.
   * Protects against slow or stalled data transfer.
   *
   * @default 30000 (30 seconds)
   *
   * @remarks Body transfer considerations:
   * - **Data size**: Varies significantly with response content
   * - **Network speed**: Accommodates slower connections
   * - **Progress detection**: Distinguishes slow vs stalled transfers
   * - **Resource protection**: Prevents indefinite resource allocation
   */
  bodyTimeout: z.number().int().positive().default(30000),

  /**
   * Automatic address family selection between IPv4 and IPv6.
   * Enables adaptive networking for optimal connectivity across different
   * network environments and Discord's infrastructure.
   *
   * @default false (IPv4 only)
   *
   * @remarks Address family selection:
   * - **IPv4**: Universal compatibility across all networks
   * - **IPv6**: Better performance in modern networks
   * - **Auto-selection**: Adapts to network capabilities
   * - **Fallback**: Graceful degradation when one protocol fails
   */
  autoSelectFamily: z.boolean().default(false),

  /**
   * Strict Content-Length validation enforcement.
   * Ensures response body size matches declared Content-Length header.
   * Improves security by detecting truncated or modified responses.
   *
   * @default true (strict validation enabled)
   *
   * @remarks Security implications:
   * - **Data integrity**: Ensures complete response reception
   * - **Attack detection**: Identifies potential response manipulation
   * - **Protocol compliance**: Enforces HTTP specification adherence
   * - **Error detection**: Catches network-level corruption early
   */
  strictContentLength: z.boolean().default(true),

  /**
   * HTTP/2 connection support enablement.
   * Allows use of HTTP/2 protocol for improved multiplexing and performance.
   * Discord API supports HTTP/2 for enhanced efficiency.
   *
   * @default true (HTTP/2 enabled)
   *
   * @remarks HTTP/2 considerations:
   * - **Performance**: Better multiplexing for concurrent requests
   * - **Compatibility**: Requires modern Node.js and network support
   * - **Complexity**: More sophisticated error handling requirements
   * - **Testing**: Additional protocol complexity in development
   */
  allowH2: z.boolean().default(true),
});

/**
 * Comprehensive configuration schema for the Discord REST client.
 * Defines authentication, API versioning, networking, and behavioral settings
 * with runtime validation to ensure correct client initialization.
 *
 * @remarks All configuration options are validated through Zod schemas
 * to provide type safety and catch configuration errors at startup rather
 * than during runtime operations.
 */
export const RestOptions = z.object({
  /**
   * Discord Bot token or Bearer token for API authentication.
   * Required for all Discord API requests to identify and authorize your application.
   * Token type determines the authentication method used.
   *
   * @example
   * ```typescript
   * // Bot token (most common)
   * const botConfig = {
   *   token: "MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs",
   *   authType: "Bot"
   * };
   *
   * // OAuth2 Bearer token
   * const oauthConfig = {
   *   token: "6qrZcUqja7812RVdnEKjpzOL4CvHBFG",
   *   authType: "Bearer"
   * };
   * ```
   *
   * @remarks Token security:
   * - **Never hardcode**: Use environment variables or secure storage
   * - **Scope appropriately**: Only request necessary permissions
   * - **Rotate regularly**: Update tokens according to security policy
   * - **Monitor usage**: Track token usage for security auditing
   *
   * @see {@link https://discord.com/developers/docs/topics/oauth2 Discord OAuth2 Documentation}
   */
  token: z.string(),

  /**
   * Authentication type indicating how the token should be presented.
   * Determines the Authorization header format for API requests.
   *
   * @default "Bot"
   *
   * @remarks Authentication types:
   * - **Bot**: For application bot tokens (`Authorization: Bot TOKEN`)
   * - **Bearer**: For OAuth2 access tokens (`Authorization: Bearer TOKEN`)
   *
   * Choose the type that matches your token:
   * - Bot tokens from the Discord Developer Portal → use "Bot"
   * - OAuth2 tokens from authorization flows → use "Bearer"
   */
  authType: z.enum(["Bot", "Bearer"]).default("Bot"),

  /**
   * Discord API version to use for all requests.
   * Currently constrained to V10 as it's the only supported stable version.
   * Future versions will be added as Discord releases them.
   *
   * @default ApiVersion.V10
   *
   * @remarks API version considerations:
   * - **Stability**: V10 is the current stable, feature-complete version
   * - **Compatibility**: Ensures consistent behavior across all endpoints
   * - **Migration**: Version changes require careful testing and migration
   * - **Deprecation**: Discord provides advance notice for version changes
   *
   * @see {@link https://discord.com/developers/docs/reference#api-versioning Discord API Versioning}
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * User agent string sent with all requests for identification.
   * Must follow Discord's required format for proper bot identification.
   * Used by Discord for monitoring, analytics, and support purposes.
   *
   * @default "DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"
   *
   * @example
   * ```typescript
   * // Custom bot user agent
   * const customConfig = {
   *   userAgent: "DiscordBot (https://github.com/myuser/mybot, 2.1.0)"
   * };
   *
   * // Organization bot user agent
   * const orgConfig = {
   *   userAgent: "DiscordBot (https://company.com/bots/helpdesk, 1.5.2)"
   * };
   * ```
   *
   * @remarks User agent importance:
   * - **Identification**: Helps Discord identify your bot in logs
   * - **Support**: Essential for troubleshooting API issues
   * - **Compliance**: Required by Discord's Terms of Service
   * - **Analytics**: Enables Discord to provide better API insights
   */
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"),

  /**
   * Base URL for Discord API requests.
   * Typically the standard Discord API endpoint, but can be customized
   * for proxy setups, testing environments, or alternative gateways.
   *
   * @default "https://discord.com"
   *
   * @example
   * ```typescript
   * // Standard configuration
   * const standard = { baseUrl: "https://discord.com" };
   *
   * // Proxy configuration
   * const proxied = { baseUrl: "https://api-proxy.mycompany.com" };
   *
   * // Testing environment
   * const testing = { baseUrl: "https://staging-api.discord.test" };
   * ```
   *
   * @remarks Base URL considerations:
   * - **Production**: Always use official Discord endpoints
   * - **Testing**: May use alternative endpoints for development
   * - **Proxies**: Corporate environments may require proxy configuration
   * - **Compliance**: Ensure alternative endpoints maintain API compatibility
   */
  baseUrl: z.url().default("https://discord.com"),

  /**
   * Global timeout for all API requests in milliseconds.
   * Requests exceeding this duration will be automatically aborted.
   * Applies to the entire request lifecycle from start to completion.
   *
   * @default 30000 (30 seconds)
   *
   * @example
   * ```typescript
   * // Quick timeout for responsive UIs
   * const responsive = { timeout: 5000 }; // 5 seconds
   *
   * // Standard timeout for most bots
   * const standard = { timeout: 30000 }; // 30 seconds
   *
   * // Extended timeout for large operations
   * const extended = { timeout: 120000 }; // 2 minutes
   * ```
   *
   * @remarks Timeout considerations:
   * - **User experience**: Shorter timeouts provide faster feedback
   * - **Reliability**: Longer timeouts handle slow network conditions
   * - **Resource management**: Prevents indefinite resource allocation
   * - **Error handling**: Clear distinction between timeouts and other failures
   */
  timeout: z.number().int().min(0).default(30000),

  /**
   * HTTP connection pool configuration for optimal performance.
   * Controls how HTTP connections are managed, reused, and timed out.
   * Significant impact on both performance and resource utilization.
   *
   * @see {@link PoolOptions} for detailed pool configuration options
   *
   * @example
   * ```typescript
   * // High-performance configuration
   * const highPerf = {
   *   pool: {
   *     connections: 20,
   *     keepAliveTimeout: 60000,
   *     maxRequestsPerClient: 15
   *   }
   * };
   *
   * // Resource-conservative configuration
   * const conservative = {
   *   pool: {
   *     connections: 5,
   *     keepAliveTimeout: 15000,
   *     maxRequestsPerClient: 5
   *   }
   * };
   * ```
   */
  pool: PoolOptions.prefault({}),

  /**
   * Request retry configuration for transient failure recovery.
   * Defines how failed requests should be automatically retried
   * to improve reliability in the face of temporary issues.
   *
   * @see {@link RetryOptions} for detailed retry configuration options
   *
   * @example
   * ```typescript
   * // Aggressive retry for critical operations
   * const aggressive = {
   *   retry: {
   *     maxRetries: 5,
   *     baseDelay: 500,
   *     retryStatusCodes: [408, 500, 502, 503, 504]
   *   }
   * };
   *
   * // Conservative retry for user-facing operations
   * const conservative = {
   *   retry: {
   *     maxRetries: 2,
   *     baseDelay: 1000,
   *     retryStatusCodes: [500, 503]
   *   }
   * };
   * ```
   */
  retry: RetryOptions.prefault({}),

  /**
   * Rate limit tracking and prevention configuration.
   * Controls how Discord's rate limits are monitored, respected,
   * and proactively managed to prevent 429 errors and IP bans.
   *
   * @see {@link RateLimitOptions} for detailed rate limit configuration options
   *
   * @example
   * ```typescript
   * // High-throughput configuration
   * const highThroughput = {
   *   rateLimit: {
   *     maxGlobalRequestsPerSecond: 45,
   *     safetyMargin: 50,
   *     maxInvalidRequests: 8000
   *   }
   * };
   *
   * // Conservative configuration
   * const conservative = {
   *   rateLimit: {
   *     maxGlobalRequestsPerSecond: 30,
   *     safetyMargin: 200,
   *     maxInvalidRequests: 5000
   *   }
   * };
   * ```
   */
  rateLimit: RateLimitOptions.prefault({}),

  /**
   * File upload processing configuration.
   * Controls how files are handled during multipart uploads,
   * including validation, processing, and memory management.
   *
   * @see {@link FileHandlerOptions} for detailed file configuration options
   *
   * @example
   * ```typescript
   * // Large file support configuration
   * const largeFiles = {
   *   file: {
   *     maxFileSize: 100 * 1024 * 1024, // 100MB
   *     maxFiles: 10,
   *     allowedTypes: ['image/*', 'video/*', 'audio/*']
   *   }
   * };
   *
   * // Strict security configuration
   * const secure = {
   *   file: {
   *     maxFileSize: 8 * 1024 * 1024, // 8MB
   *     maxFiles: 3,
   *     allowedTypes: ['image/png', 'image/jpeg', 'image/gif']
   *   }
   * };
   * ```
   */
  file: FileHandlerOptions.prefault({}),
});

export type RestOptions = z.infer<typeof RestOptions>;

/**
 * Advanced Discord REST API client with comprehensive bot development features.
 *
 * Provides a production-ready interface for Discord API interaction with sophisticated
 * built-in capabilities designed specifically for bot development and high-scale applications.
 * Handles the complexity of Discord's API patterns while providing a clean, type-safe interface.
 *
 * ### Basic Bot Setup
 * ```typescript
 * import { Rest } from '@nyxojs/rest';
 *
 * const rest = new Rest({
 *   token: process.env.DISCORD_TOKEN!,
 *   userAgent: 'DiscordBot (https://github.com/mybot, 1.0.0)'
 * });
 *
 * // Send a message
 * const message = await rest.channels.createMessage('123456789', {
 *   content: 'Hello, Discord!'
 * });
 *
 * // Get guild information
 * const guild = await rest.guilds.getGuild('987654321');
 * ```
 *
 * ### High-Performance Configuration
 * ```typescript
 * const rest = new Rest({
 *   token: process.env.DISCORD_TOKEN!,
 *   pool: {
 *     connections: 25,
 *     maxRequestsPerClient: 20,
 *     keepAliveTimeout: 60000
 *   },
 *   rateLimit: {
 *     maxGlobalRequestsPerSecond: 45,
 *     safetyMargin: 50
 *   },
 *   retry: {
 *     maxRetries: 5,
 *     baseDelay: 500
 *   }
 * });
 * ```
 *
 * ### Enterprise Monitoring Setup
 * ```typescript
 * const rest = new Rest(config);
 *
 * // Monitor rate limits
 * rest.on('rateLimitHit', (event) => {
 *   console.warn(`Rate limit hit: ${event.route} - ${event.resetAfter}ms`);
 *   metrics.increment('discord.rate_limit.hit', {
 *     route: event.route,
 *     bucket: event.bucketId
 *   });
 * });
 *
 * // Track request performance
 * rest.on('request', (event) => {
 *   metrics.timing('discord.request.duration', event.duration, {
 *     method: event.method,
 *     status: event.statusCode.toString()
 *   });
 * });
 *
 * // Monitor retry patterns
 * rest.on('retry', (event) => {
 *   console.log(`Retry ${event.attempt}/${event.maxAttempts}: ${event.reason}`);
 *   metrics.increment('discord.request.retry', {
 *     reason: event.reason,
 *     attempt: event.attempt.toString()
 *   });
 * });
 * ```
 *
 * ### File Upload Handling
 * ```typescript
 * import { readFile } from 'fs/promises';
 *
 * // Upload an image with message
 * const imageData = await readFile('./image.png');
 * const message = await rest.channels.createMessage('123456789', {
 *   content: 'Check out this image!',
 *   files: [{
 *     name: 'cool-image.png',
 *     data: imageData,
 *     contentType: 'image/png'
 *   }]
 * });
 *
 * // Bulk file upload
 * const files = await Promise.all([
 *   readFile('./doc1.pdf'),
 *   readFile('./doc2.pdf')
 * ]);
 *
 * await rest.channels.createMessage('123456789', {
 *   content: 'Document attachments',
 *   files: files.map((data, i) => ({
 *     name: `document-${i + 1}.pdf`,
 *     data,
 *     contentType: 'application/pdf'
 *   }))
 * });
 * ```
 *
 * ### Error Handling Best Practices
 * ```typescript
 * try {
 *   const user = await rest.users.getUser('123456789');
 * } catch (error) {
 *   if (error.message.includes('404')) {
 *     console.log('User not found');
 *   } else if (error.message.includes('403')) {
 *     console.log('Permission denied');
 *   } else if (error.message.includes('Rate limit')) {
 *     console.log('Rate limited - will be retried automatically');
 *   } else {
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 *
 * ## Resource Management
 *
 * The REST client manages multiple types of resources that should be properly cleaned up:
 *
 * ```typescript
 * // Graceful shutdown
 * process.on('SIGTERM', async () => {
 *   console.log('Shutting down REST client...');
 *   await rest.destroy();
 *   process.exit(0);
 * });
 *
 * // Error handling
 * process.on('unhandledRejection', async (error) => {
 *   console.error('Unhandled rejection:', error);
 *   await rest.destroy();
 *   process.exit(1);
 * });
 * ```
 *
 * @remarks This client is specifically optimized for Discord's API patterns and
 * requirements. While it could theoretically work with other APIs, it includes
 * Discord-specific optimizations that may not be appropriate for other services.
 *
 * @see {@link https://discord.com/developers/docs/intro Discord Developer Documentation}
 * @see {@link https://discord.com/developers/docs/topics/rate-limits Rate Limits Documentation}
 */
export class Rest extends EventEmitter<RestEvents> {
  /**
   * Application management router providing access to application-related endpoints.
   * Handles application information, ownership, and configuration operations.
   *
   * @example
   * ```typescript
   * // Get current application information
   * const app = await rest.applications.getCurrentApplication();
   *
   * // Update application information
   * await rest.applications.editCurrentApplication({
   *   description: 'Updated bot description'
   * });
   * ```
   */
  readonly applications = new ApplicationRouter(this);

  /**
   * Audit log router providing access to guild audit log endpoints.
   * Enables retrieval and analysis of moderation and administrative actions.
   *
   * @example
   * ```typescript
   * // Get recent audit log entries
   * const auditLog = await rest.auditLogs.getGuildAuditLog('123456789', {
   *   action_type: 1, // Member kick
   *   limit: 50
   * });
   * ```
   */
  readonly auditLogs = new AuditLogRouter(this);

  /**
   * Auto-moderation router providing access to automatic content moderation endpoints.
   * Manages auto-moderation rules, triggers, and actions for guild safety.
   *
   * @example
   * ```typescript
   * // Create auto-moderation rule
   * const rule = await rest.autoModeration.createAutoModerationRule('123456789', {
   *   name: 'Block Spam',
   *   event_type: 1,
   *   trigger_type: 3,
   *   actions: [{ type: 1 }]
   * });
   * ```
   */
  readonly autoModeration = new AutoModerationRouter(this);

  /**
   * Channel management router providing access to all channel-related endpoints.
   * Handles text channels, voice channels, categories, threads, and their permissions.
   *
   * @example
   * ```typescript
   * // Create a new text channel
   * const channel = await rest.channels.createGuildChannel('123456789', {
   *   name: 'general-chat',
   *   type: 0 // Text channel
   * });
   *
   * // Send a message to a channel
   * const message = await rest.channels.createMessage('987654321', {
   *   content: 'Hello, world!'
   * });
   * ```
   */
  readonly channels = new ChannelRouter(this);

  /**
   * Application command router providing access to slash command and interaction endpoints.
   * Manages command registration, updates, permissions, and response handling.
   *
   * @example
   * ```typescript
   * // Register a global slash command
   * const command = await rest.commands.createGlobalApplicationCommand({
   *   name: 'hello',
   *   description: 'Say hello to someone',
   *   options: [{
   *     type: 6, // User
   *     name: 'user',
   *     description: 'User to greet',
   *     required: true
   *   }]
   * });
   * ```
   */
  readonly commands = new ApplicationCommandRouter(this);

  /**
   * Application connection router providing access to connection management endpoints.
   * Handles linked accounts, integrations, and third-party service connections.
   *
   * @example
   * ```typescript
   * // Get user connections
   * const connections = await rest.connections.getUserConnections();
   * ```
   */
  readonly connections = new ApplicationConnectionRouter(this);

  /**
   * Emoji management router providing access to custom emoji endpoints.
   * Manages guild custom emojis, including creation, modification, and deletion.
   *
   * @example
   * ```typescript
   * // Create a custom emoji
   * const emoji = await rest.emojis.createGuildEmoji('123456789', {
   *   name: 'custom_emoji',
   *   image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
   * });
   * ```
   */
  readonly emojis = new EmojiRouter(this);

  /**
   * Entitlement management router providing access to premium subscription endpoints.
   * Handles application entitlements, premium features, and subscription management.
   *
   * @example
   * ```typescript
   * // Get application entitlements
   * const entitlements = await rest.entitlements.getApplicationEntitlements('123456789');
   * ```
   */
  readonly entitlements = new EntitlementRouter(this);

  /**
   * Gateway information router providing access to WebSocket gateway endpoints.
   * Retrieves gateway URLs, shard information, and connection recommendations.
   *
   * @example
   * ```typescript
   * // Get gateway URL
   * const gateway = await rest.gateway.getGateway();
   *
   * // Get bot-specific gateway information
   * const botGateway = await rest.gateway.getGatewayBot();
   * console.log(`Recommended shards: ${botGateway.shards}`);
   * ```
   */
  readonly gateway = new GatewayRouter(this);

  /**
   * Guild management router providing access to server-related endpoints.
   * Manages guilds, members, roles, bans, and server configuration.
   *
   * @example
   * ```typescript
   * // Get guild information
   * const guild = await rest.guilds.getGuild('123456789');
   *
   * // Add member to guild
   * await rest.guilds.addGuildMember('123456789', '987654321', {
   *   access_token: 'oauth2_access_token'
   * });
   *
   * // Create a new role
   * const role = await rest.guilds.createGuildRole('123456789', {
   *   name: 'Moderator',
   *   permissions: '8', // Administrator
   *   color: 0x00ff00
   * });
   * ```
   */
  readonly guilds = new GuildRouter(this);

  /**
   * Interaction response router providing access to interaction handling endpoints.
   * Manages responses to slash commands, buttons, select menus, and modals.
   *
   * @example
   * ```typescript
   * // Respond to a slash command interaction
   * await rest.interactions.createInteractionResponse('123456789', 'token', {
   *   type: 4, // Channel message with source
   *   data: {
   *     content: 'Command executed successfully!'
   *   }
   * });
   *
   * // Follow up to an interaction
   * await rest.interactions.createFollowupMessage('123456789', 'token', {
   *   content: 'This is a follow-up message'
   * });
   * ```
   */
  readonly interactions = new InteractionRouter(this);

  /**
   * Invite management router providing access to guild and channel invite endpoints.
   * Handles invite creation, retrieval, and management operations.
   *
   * @example
   * ```typescript
   * // Create a channel invite
   * const invite = await rest.invites.createChannelInvite('123456789', {
   *   max_age: 3600, // 1 hour
   *   max_uses: 10
   * });
   *
   * // Get invite information
   * const inviteInfo = await rest.invites.getInvite('abc123');
   * ```
   */
  readonly invites = new InviteRouter(this);

  /**
   * Lobby management router providing access to voice lobby endpoints.
   * Manages voice channel lobbies and party functionality.
   *
   * @example
   * ```typescript
   * // Create a voice lobby
   * const lobby = await rest.lobby.createLobby({
   *   type: 1,
   *   region: 'us-west',
   *   capacity: 10
   * });
   * ```
   */
  readonly lobby = new LobbyRouter(this);

  /**
   * Message management router providing access to message-related endpoints.
   * Handles message sending, editing, reactions, and bulk operations.
   *
   * @example
   * ```typescript
   * // Send a complex message with embeds
   * const message = await rest.messages.createMessage('123456789', {
   *   content: 'Check out this embed!',
   *   embeds: [{
   *     title: 'Cool Embed',
   *     description: 'This is an embedded message',
   *     color: 0x00ff00,
   *     fields: [{
   *       name: 'Field 1',
   *       value: 'Field value',
   *       inline: true
   *     }]
   *   }]
   * });
   *
   * // Add reactions to a message
   * await rest.messages.createReaction('123456789', message.id, '👍');
   * await rest.messages.createReaction('123456789', message.id, '👎');
   * ```
   */
  readonly messages = new MessageRouter(this);

  /**
   * OAuth2 management router providing access to OAuth2 and authorization endpoints.
   * Handles token management, authorization flows, and application credentials.
   *
   * @example
   * ```typescript
   * // Get current application information via OAuth2
   * const application = await rest.oauth2.getCurrentApplication();
   *
   * // Exchange authorization code for token
   * const tokenResponse = await rest.oauth2.createToken({
   *   client_id: 'your_client_id',
   *   client_secret: 'your_client_secret',
   *   grant_type: 'authorization_code',
   *   code: 'authorization_code'
   * });
   * ```
   */
  readonly oauth2 = new OAuth2Router(this);

  /**
   * Poll management router providing access to message poll endpoints.
   * Manages poll creation, voting, and result tracking within messages.
   *
   * @example
   * ```typescript
   * // Create a message with a poll
   * const pollMessage = await rest.polls.createMessage('123456789', {
   *   poll: {
   *     question: { text: 'What\'s your favorite color?' },
   *     answers: [
   *       { answer_id: 1, poll_media: { text: 'Red' } },
   *       { answer_id: 2, poll_media: { text: 'Blue' } },
   *       { answer_id: 3, poll_media: { text: 'Green' } }
   *     ],
   *     duration: 24 // 24 hours
   *   }
   * });
   * ```
   */
  readonly polls = new PollRouter(this);

  /**
   * Scheduled event router providing access to guild event endpoints.
   * Manages guild scheduled events, RSVPs, and event notifications.
   *
   * @example
   * ```typescript
   * // Create a scheduled event
   * const event = await rest.scheduledEvents.createGuildScheduledEvent('123456789', {
   *   name: 'Community Game Night',
   *   description: 'Join us for some fun games!',
   *   scheduled_start_time: '2024-12-25T20:00:00Z',
   *   scheduled_end_time: '2024-12-25T23:00:00Z',
   *   privacy_level: 2, // Guild only
   *   entity_type: 3, // External
   *   entity_metadata: {
   *     location: 'Community Discord'
   *   }
   * });
   * ```
   */
  readonly scheduledEvents = new ScheduledEventRouter(this);

  /**
   * SKU management router providing access to application monetization endpoints.
   * Handles application SKUs, pricing, and subscription products.
   *
   * @example
   * ```typescript
   * // Get application SKUs
   * const skus = await rest.skus.getApplicationSkus('123456789');
   * ```
   */
  readonly skus = new SkuRouter(this);

  /**
   * Soundboard router providing access to guild soundboard endpoints.
   * Manages custom sounds, sound effects, and audio content for voice channels.
   *
   * @example
   * ```typescript
   * // Get guild soundboard sounds
   * const sounds = await rest.soundboards.getGuildSoundboardSounds('123456789');
   *
   * // Play a soundboard sound
   * await rest.soundboards.sendSoundboardSound('123456789', '987654321', {
   *   sound_id: 'sound_12345'
   * });
   * ```
   */
  readonly soundboards = new SoundboardRouter(this);

  /**
   * Stage instance router providing access to stage channel endpoints.
   * Manages stage channels, speaker permissions, and live events.
   *
   * @example
   * ```typescript
   * // Create a stage instance
   * const stage = await rest.stages.createStageInstance({
   *   channel_id: '123456789',
   *   topic: 'Community Discussion',
   *   privacy_level: 1 // Guild only
   * });
   *
   * // Update stage instance
   * await rest.stages.modifyStageInstance('123456789', {
   *   topic: 'Updated Discussion Topic'
   * });
   * ```
   */
  readonly stages = new StageInstanceRouter(this);

  /**
   * Sticker management router providing access to custom sticker endpoints.
   * Manages guild stickers, sticker packs, and sticker applications.
   *
   * @example
   * ```typescript
   * // Create a guild sticker
   * const sticker = await rest.stickers.createGuildSticker('123456789', {
   *   name: 'custom_sticker',
   *   description: 'A custom guild sticker',
   *   tags: 'happy,emoji',
   *   file: stickerImageData
   * });
   *
   * // Get nitro sticker packs
   * const packs = await rest.stickers.getNitroStickerPacks();
   * ```
   */
  readonly stickers = new StickerRouter(this);

  /**
   * Subscription router providing access to premium subscription endpoints.
   * Manages user subscriptions, premium features, and billing information.
   *
   * @example
   * ```typescript
   * // Get user subscriptions
   * const subscriptions = await rest.subscriptions.getUserSubscriptions();
   * ```
   */
  readonly subscriptions = new SubscriptionRouter(this);

  /**
   * Guild template router providing access to server template endpoints.
   * Manages guild templates for server creation and configuration sharing.
   *
   * @example
   * ```typescript
   * // Create a guild template
   * const template = await rest.templates.createGuildTemplate('123456789', {
   *   name: 'Community Server Template',
   *   description: 'Template for community Discord servers'
   * });
   *
   * // Create guild from template
   * const newGuild = await rest.templates.createGuildFromTemplate('template_code', {
   *   name: 'My New Community Server'
   * });
   * ```
   */
  readonly templates = new GuildTemplateRouter(this);

  /**
   * User management router providing access to user-related endpoints.
   * Manages user profiles, DMs, connections, and account information.
   *
   * @example
   * ```typescript
   * // Get current user information
   * const currentUser = await rest.users.getCurrentUser();
   *
   * // Get another user's profile
   * const user = await rest.users.getUser('123456789');
   *
   * // Create a DM channel
   * const dmChannel = await rest.users.createDM({
   *   recipient_id: '987654321'
   * });
   *
   * // Send a DM
   * await rest.channels.createMessage(dmChannel.id, {
   *   content: 'Hello! This is a direct message.'
   * });
   * ```
   */
  readonly users = new UserRouter(this);

  /**
   * Voice channel router providing access to voice-related endpoints.
   * Manages voice states, voice regions, and voice channel operations.
   *
   * @example
   * ```typescript
   * // Get voice regions
   * const regions = await rest.voice.listVoiceRegions();
   *
   * // Modify current user's voice state
   * await rest.voice.modifyCurrentUserVoiceState('123456789', {
   *   channel_id: '987654321',
   *   suppress: false,
   *   request_to_speak_timestamp: new Date().toISOString()
   * });
   * ```
   */
  readonly voice = new VoiceRouter(this);

  /**
   * Webhook management router providing access to webhook endpoints.
   * Manages webhook creation, configuration, and message sending.
   *
   * @example
   * ```typescript
   * // Create a channel webhook
   * const webhook = await rest.webhooks.createWebhook('123456789', {
   *   name: 'GitHub Bot',
   *   avatar: avatarImageData
   * });
   *
   * // Send a message via webhook
   * await rest.webhooks.executeWebhook(webhook.id, webhook.token, {
   *   content: 'Deployment completed successfully!',
   *   username: 'Deploy Bot',
   *   embeds: [{
   *     title: 'Deployment Status',
   *     description: 'Production deployment completed',
   *     color: 0x00ff00,
   *     timestamp: new Date().toISOString()
   *   }]
   * });
   * ```
   */
  readonly webhooks = new WebhookRouter(this);

  /**
   * HTTP connection pool managing persistent connections to Discord API.
   * Handles connection lifecycle, pooling, and performance optimization.
   * Configured through pool options in RestOptions.
   *
   * @internal
   * @remarks This pool is automatically managed and should not be accessed directly.
   * Use the high-level request methods instead.
   */
  readonly pool: Pool;

  /**
   * Rate limit manager providing proactive rate limit protection.
   * Monitors, tracks, and enforces Discord's rate limits to prevent violations
   * and maintain compliance with API usage policies.
   *
   * @remarks Automatically handles:
   * - Global rate limits (50 requests/second)
   * - Per-route bucket limits
   * - Cloudflare protection limits
   * - Adaptive safety margins
   * - Rate limit recovery and reset tracking
   */
  readonly rateLimiter: RateLimitManager;

  /**
   * Retry manager providing intelligent failure recovery.
   * Implements sophisticated retry strategies for transient failures
   * with error classification and adaptive backoff algorithms.
   *
   * @remarks Automatically handles:
   * - Network connectivity issues
   * - Server errors (5xx responses)
   * - Timeout and connection failures
   * - Exponential backoff with jitter
   * - Error categorization for optimal strategies
   */
  readonly retry: RetryManager;

  /**
   * File handler managing multipart uploads and file processing.
   * Provides secure file validation, processing, and efficient upload
   * handling for Discord's file attachment system.
   *
   * @remarks Supports:
   * - Multiple file uploads per message
   * - File type and size validation
   * - Secure filename sanitization
   * - Memory-efficient processing
   * - Progress tracking and error handling
   */
  readonly file: FileHandler;

  /**
   * Validated and immutable configuration options.
   * All options are guaranteed valid through Zod schema validation
   * and remain constant throughout the client's lifecycle.
   *
   * @internal
   */
  readonly #options: RestOptions;

  /**
   * Creates a new Discord REST API client with comprehensive configuration validation.
   *
   * Initializes all subsystems including HTTP pooling, rate limiting, retry management,
   * and file handling. Performs immediate validation of all configuration options
   * to catch errors at startup rather than during runtime operations.
   *
   * @param options - Complete client configuration including authentication and behavior settings
   *
   * @throws {Error} Configuration validation errors with detailed field-specific messages
   * @throws {Error} Authentication errors if token format is invalid
   * @throws {Error} Network configuration errors if baseUrl or proxy settings are invalid
   *
   * @example
   * ```typescript
   * // Basic bot configuration
   * const rest = new Rest({
   *   token: process.env.DISCORD_TOKEN!,
   *   userAgent: 'DiscordBot (https://github.com/mybot, 1.0.0)'
   * });
   *
   * // Production configuration with optimizations
   * const rest = new Rest({
   *   token: process.env.DISCORD_TOKEN!,
   *   userAgent: 'DiscordBot (https://enterprise.com/bot, 2.1.0)',
   *   timeout: 45000,
   *   pool: {
   *     connections: 20,
   *     keepAliveTimeout: 60000,
   *     maxRequestsPerClient: 15
   *   },
   *   rateLimit: {
   *     maxGlobalRequestsPerSecond: 45,
   *     safetyMargin: 100,
   *     maxInvalidRequests: 8000
   *   },
   *   retry: {
   *     maxRetries: 3,
   *     baseDelay: 1000,
   *     retryStatusCodes: [500, 502, 503, 504]
   *   },
   *   file: {
   *     maxFileSize: 100 * 1024 * 1024, // 100MB
   *     maxFiles: 10
   *   }
   * });
   *
   * // OAuth2 Bearer token configuration
   * const rest = new Rest({
   *   token: 'oauth2_access_token_here',
   *   authType: 'Bearer',
   *   userAgent: 'DiscordBot (https://oauth-app.com, 1.0.0)'
   * });
   * ```
   *
   * @remarks The constructor performs several critical initialization steps:
   * 1. **Configuration validation**: All options validated through Zod schemas
   * 2. **HTTP pool creation**: Connection pool established with specified settings
   * 3. **Manager initialization**: Rate limiter and retry manager configured
   * 4. **File handler setup**: Upload processing system prepared
   * 5. **Event system setup**: EventEmitter initialized for monitoring
   *
   * Any configuration errors are caught immediately during construction rather
   * than surfacing as runtime failures during API operations.
   */
  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    // Initialize the HTTP connection pool with validated options
    this.pool = new Pool(this.#options.baseUrl, this.#options.pool);

    // Initialize subsystem managers for advanced functionality
    this.rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
    this.retry = new RetryManager(this, this.#options.retry);

    // Initialize file handling for multipart uploads
    this.file = new FileHandler(this.#options.file);
  }

  /**
   * Executes a complete Discord API request with automatic rate limiting and retry handling.
   *
   * This is the core request method that orchestrates the entire request lifecycle:
   * 1. **Request ID generation**: Creates unique identifier for tracking and correlation
   * 2. **Rate limit checking**: Proactively validates request against known limits
   * 3. **HTTP execution**: Performs the actual network request with retry logic
   * 4. **Rate limit updates**: Processes response headers to update limit tracking
   * 5. **Error handling**: Provides structured error responses with context
   *
   * @param options - Complete request configuration including path, method, body, and metadata
   * @returns Promise resolving to parsed response data of specified type
   *
   * @throws {Error} Rate limit errors when limits cannot be resolved through waiting
   * @throws {Error} Authentication errors (401) with clear failure description
   * @throws {Error} Permission errors (403) with resource and action context
   * @throws {Error} Not found errors (404) with resource identification
   * @throws {Error} Client errors (4xx) with Discord API error details
   * @throws {Error} Server errors (5xx) after retry attempts are exhausted
   * @throws {Error} Network errors when connectivity issues persist
   * @throws {Error} Timeout errors when requests exceed configured duration
   *
   * @example
   * ```typescript
   * // Simple GET request
   * const user = await rest.request<User>({
   *   method: 'GET',
   *   path: '/users/@me'
   * });
   *
   * // POST request with JSON body
   * const message = await rest.request<Message>({
   *   method: 'POST',
   *   path: '/channels/123456789/messages',
   *   body: JSON.stringify({
   *     content: 'Hello, Discord!'
   *   }),
   *   headers: {
   *     'Content-Type': 'application/json'
   *   }
   * });
   *
   * // Request with file upload
   * const messageWithFile = await rest.request<Message>({
   *   method: 'POST',
   *   path: '/channels/123456789/messages',
   *   body: JSON.stringify({
   *     content: 'Check out this file!'
   *   }),
   *   files: [{
   *     name: 'document.pdf',
   *     data: fileBuffer,
   *     contentType: 'application/pdf'
   *   }]
   * });
   *
   * // Request with audit log reason
   * await rest.request({
   *   method: 'DELETE',
   *   path: '/guilds/123456789/members/987654321',
   *   reason: 'Spam violation - automated action'
   * });
   *
   * // Request with query parameters
   * const messages = await rest.request<Message[]>({
   *   method: 'GET',
   *   path: '/channels/123456789/messages',
   *   query: {
   *     limit: 50,
   *     before: '1234567890123456789'
   *   }
   * });
   * ```
   *
   * ## Request Flow Details
   *
   * ### Rate Limit Protection
   * Before any network activity, the request is evaluated against:
   * - **Global rate limits**: 50 requests/second across all endpoints
   * - **Bucket rate limits**: Per-endpoint specific limits from Discord
   * - **Cloudflare protection**: Invalid request tracking to prevent IP bans
   * - **Safety margins**: Configurable buffers to prevent race conditions
   *
   * ### Retry Logic Integration
   * Failed requests are automatically retried using intelligent strategies:
   * - **Network errors**: Fast initial retry, then exponential backoff
   * - **Server errors**: Exponential backoff with jitter for load distribution
   * - **Client errors**: Conservative retry with longer delays
   * - **Unknown errors**: Moderate backoff for safety
   *
   * ### Rate Limit Updates
   * Every response updates the rate limit tracking system:
   * - **Bucket discovery**: New buckets are learned and cached
   * - **Limit updates**: Current limits and reset times are tracked
   * - **Route mapping**: API routes are mapped to their rate limit buckets
   * - **Cache invalidation**: Stale rate limit decisions are cleared
   *
   * ### Error Enhancement
   * Failed requests receive enhanced error context:
   * - **Request correlation**: Unique IDs for end-to-end tracing
   * - **Resource identification**: Specific resources and IDs involved
   * - **Permission context**: Clear description of required permissions
   * - **Retry information**: Details about retry attempts and failures
   *
   * @remarks This method should be used for all Discord API interactions rather
   * than direct HTTP client usage. It provides essential Discord-specific handling
   * that is required for reliable bot operation.
   */
  async request<T>(options: HttpRequestOptions): Promise<T> {
    // Generate a unique request ID for comprehensive tracking and correlation
    const requestId = crypto.randomUUID();

    // Proactively check rate limits before making the request
    // This prevents 429 errors and respects Discord's API usage policies
    const rateLimitCheck = await this.rateLimiter.checkAndWaitIfNeeded(
      options.path,
      options.method,
      requestId,
    );

    // If rate limit cannot be resolved, fail immediately with clear error
    if (!rateLimitCheck.canProceed) {
      throw new Error(
        `[${options.method} ${options.path}] Rate limit exceeded: ${rateLimitCheck.reason}. Try again in ${rateLimitCheck.retryAfter}ms.`,
      );
    }

    // Execute the HTTP request with intelligent retry handling for non-rate-limit errors
    const response = await this.retry.processResponse<T>(
      () => this.#makeHttpRequest<T>(options, requestId),
      requestId,
      options.method,
      options.path,
    );

    // Update rate limit tracking with information from the response
    // This learning process improves future rate limit predictions
    await this.rateLimiter.updateRateLimitAndWaitIfNeeded(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
      requestId,
    );

    // Check response status and handle errors with enhanced context
    if (response.statusCode >= 400) {
      throw this.#createErrorFromResponse(response, options, requestId);
    }

    // Return successfully parsed response data
    return response.data;
  }

  /**
   * Executes a GET request with automatic rate limiting and error handling.
   * Convenience method optimized for read operations and data retrieval.
   *
   * @param path - Discord API endpoint path (e.g., '/users/@me', '/guilds/123456789')
   * @param options - Additional request configuration (headers, query parameters, etc.)
   * @returns Promise resolving to the parsed response data
   *
   * @example
   * ```typescript
   * // Get current user information
   * const user = await rest.get<User>('/users/@me');
   *
   * // Get guild with query parameters
   * const guild = await rest.get<Guild>('/guilds/123456789', {
   *   query: { with_counts: true }
   * });
   *
   * // Get with custom headers
   * const data = await rest.get('/custom-endpoint', {
   *   headers: { 'X-Custom-Header': 'value' }
   * });
   * ```
   */
  get<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  /**
   * Executes a POST request with automatic rate limiting and error handling.
   * Convenience method optimized for resource creation and data submission.
   *
   * @param path - Discord API endpoint path for resource creation
   * @param options - Request configuration including body data and headers
   * @returns Promise resolving to the created resource data
   *
   * @example
   * ```typescript
   * // Create a message
   * const message = await rest.post<Message>('/channels/123456789/messages', {
   *   body: JSON.stringify({
   *     content: 'Hello, Discord!',
   *     embeds: [{
   *       title: 'Announcement',
   *       description: 'This is an important update'
   *     }]
   *   })
   * });
   *
   * // Create a guild role
   * const role = await rest.post<Role>('/guilds/123456789/roles', {
   *   body: JSON.stringify({
   *     name: 'New Role',
   *     permissions: '8',
   *     color: 0x00ff00
   *   }),
   *   reason: 'Creating moderator role'
   * });
   *
   * // Upload file with message
   * const fileMessage = await rest.post<Message>('/channels/123456789/messages', {
   *   body: JSON.stringify({ content: 'File upload' }),
   *   files: [{
   *     name: 'attachment.png',
   *     data: imageBuffer,
   *     contentType: 'image/png'
   *   }]
   * });
   * ```
   */
  post<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  /**
   * Executes a PUT request with automatic rate limiting and error handling.
   * Convenience method optimized for complete resource replacement operations.
   *
   * @param path - Discord API endpoint path for resource replacement
   * @param options - Request configuration including replacement data
   * @returns Promise resolving to the updated resource data
   *
   * @example
   * ```typescript
   * // Replace guild member roles (overwrites existing roles)
   * await rest.put(`/guilds/123456789/members/987654321/roles/555666777`, {
   *   reason: 'Promoting user to moderator'
   * });
   *
   * // Replace channel permissions
   * await rest.put(`/channels/123456789/permissions/987654321`, {
   *   body: JSON.stringify({
   *     allow: '1024', // View channel
   *     deny: '2048',  // Send messages
   *     type: 1       // Member
   *   })
   * });
   * ```
   */
  put<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  /**
   * Executes a PATCH request with automatic rate limiting and error handling.
   * Convenience method optimized for partial resource updates and modifications.
   *
   * @param path - Discord API endpoint path for resource modification
   * @param options - Request configuration including update data
   * @returns Promise resolving to the modified resource data
   *
   * @example
   * ```typescript
   * // Update guild information
   * const guild = await rest.patch<Guild>('/guilds/123456789', {
   *   body: JSON.stringify({
   *     name: 'Updated Guild Name',
   *     description: 'New guild description'
   *   }),
   *   reason: 'Rebranding guild'
   * });
   *
   * // Modify channel settings
   * const channel = await rest.patch<Channel>('/channels/123456789', {
   *   body: JSON.stringify({
   *     name: 'updated-channel-name',
   *     topic: 'New channel topic'
   *   })
   * });
   *
   * // Update user settings
   * const user = await rest.patch<User>('/users/@me', {
   *   body: JSON.stringify({
   *     username: 'NewUsername'
   *   })
   * });
   * ```
   */
  patch<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  /**
   * Executes a DELETE request with automatic rate limiting and error handling.
   * Convenience method optimized for resource removal and cleanup operations.
   *
   * @param path - Discord API endpoint path for resource deletion
   * @param options - Request configuration including deletion reason
   * @returns Promise resolving to the deletion result (often empty)
   *
   * @example
   * ```typescript
   * // Delete a message
   * await rest.delete('/channels/123456789/messages/987654321', {
   *   reason: 'Spam content removed'
   * });
   *
   * // Remove guild member
   * await rest.delete('/guilds/123456789/members/987654321', {
   *   reason: 'Violation of community guidelines'
   * });
   *
   * // Delete guild role
   * await rest.delete('/guilds/123456789/roles/555666777', {
   *   reason: 'Role no longer needed'
   * });
   *
   * // Delete channel
   * await rest.delete('/channels/123456789', {
   *   reason: 'Channel cleanup - inactive'
   * });
   * ```
   */
  delete<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  /**
   * Gracefully destroys the REST client and cleans up all allocated resources.
   *
   * Performs comprehensive cleanup to prevent memory leaks and ensure proper
   * resource deallocation. This method should be called when the client is no
   * longer needed, typically during application shutdown or restart.
   *
   * ## Cleanup Operations
   *
   * 1. **HTTP Pool Closure**: Closes all persistent connections and clears the pool
   * 2. **Rate Limiter Destruction**: Clears all rate limit tracking and caches
   * 3. **File Handler Cleanup**: Clears temporary files and upload state
   * 4. **Event Listener Removal**: Removes all event listeners to prevent leaks
   * 5. **Timer Cancellation**: Cancels any pending timeouts or intervals
   *
   * @returns Promise that resolves when all cleanup operations are complete
   *
   * @example
   * ```typescript
   * // Graceful application shutdown
   * process.on('SIGTERM', async () => {
   *   console.log('Shutting down Discord bot...');
   *
   *   // Clean up REST client
   *   await rest.destroy();
   *
   *   // Close database connections, etc.
   *   await database.close();
   *
   *   console.log('Shutdown complete');
   *   process.exit(0);
   * });
   *
   * // Error handling shutdown
   * process.on('unhandledRejection', async (error) => {
   *   console.error('Unhandled rejection:', error);
   *
   *   // Emergency cleanup
   *   await rest.destroy();
   *   process.exit(1);
   * });
   *
   * // Manual cleanup in long-running applications
   * const cleanupInterval = setInterval(async () => {
   *   // Restart REST client periodically for memory management
   *   await oldRest.destroy();
   *   const newRest = new Rest(config);
   * }, 24 * 60 * 60 * 1000); // Daily restart
   * ```
   *
   * @remarks After calling destroy(), the REST client instance becomes unusable
   * and any further method calls will result in errors. Create a new instance
   * if continued operation is required.
   *
   * **Memory Management**: This method is essential for long-running applications
   * to prevent memory leaks from accumulated rate limit data, cached responses,
   * and persistent HTTP connections.
   *
   * **Graceful Shutdown**: In production environments, always call destroy()
   * during application shutdown to ensure clean termination and proper resource
   * release.
   */
  async destroy(): Promise<void> {
    // Close the HTTP connection pool and terminate all active connections
    await this.pool.close();

    // Destroy rate limiter to clear all tracking data and timers
    this.rateLimiter.destroy();

    // Clear file handler to remove temporary files and upload state
    this.file.clear();

    // Remove all event listeners to prevent memory leaks
    this.removeAllListeners();
  }

  /**
   * Creates comprehensive error objects from failed API responses.
   * Analyzes response status codes and data to provide detailed, actionable
   * error information for debugging and user feedback.
   *
   * @param response - Failed HTTP response containing status and error data
   * @param options - Original request options for context
   * @param requestId - Unique request identifier for correlation
   * @returns Enhanced Error object with detailed failure information
   *
   * @internal
   */
  #createErrorFromResponse<T>(
    response: HttpResponse<T>,
    options: HttpRequestOptions,
    requestId: string,
  ): Error {
    // Build consistent error prefix with request context
    const errorPrefix = `[${options.method} ${options.path}] ${response.statusCode} (requestId: ${requestId})`;

    // Handle structured Discord API errors with specific codes
    if (this.#isJsonErrorEntity(response.data)) {
      const jsonError = response.data as unknown as JsonErrorResponse;
      const message = response.reason || jsonError.message;

      // Format field-specific validation errors if present
      let errorDetails = "";
      if (jsonError.errors) {
        const fieldErrors = this.#formatFieldErrors(jsonError.errors);
        if (fieldErrors) {
          errorDetails = ` (${fieldErrors})`;
        }
      }

      return new Error(
        `${errorPrefix}: Discord API Error ${jsonError.code} - ${message}${errorDetails}`,
      );
    }

    // Handle common HTTP status codes with specific messaging
    switch (response.statusCode) {
      case 401:
        return new Error(
          `${errorPrefix}: Authentication failed - ${response.reason || "Invalid credentials"}`,
        );

      case 403:
        return new Error(
          `${errorPrefix}: Permission denied - ${response.reason || "You lack permissions to perform this action"}`,
        );

      case 404: {
        // Extract resource information for better error messages
        const resourceType =
          this.#extractResourceType(options.path) || "resource";
        const resourceId = this.#extractResourceId(options.path) || "unknown";
        return new Error(
          `${errorPrefix}: Not found - ${resourceType} (ID: ${resourceId}) ${response.reason || "The requested resource was not found"}`,
        );
      }

      default:
        // Generic API error for other status codes
        return new Error(
          `${errorPrefix}: Request failed - ${response.reason || `Status ${response.statusCode}`}`,
        );
    }
  }

  /**
   * Executes low-level HTTP requests with comprehensive event tracking.
   * Handles request preparation, execution, response parsing, and event emission
   * for monitoring and observability.
   *
   * @param options - Complete request configuration
   * @param requestId - Unique identifier for request tracking
   * @returns Promise resolving to normalized HTTP response
   *
   * @internal
   */
  async #makeHttpRequest<T>(
    options: HttpRequestOptions,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const requestStart = Date.now();

    // Create abort controller for request timeout handling
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#options.timeout);

    try {
      // Prepare request (handle file uploads if present)
      const preparedRequest = options.files
        ? await this.#handleFileUpload(options)
        : options;

      // Construct the full API path
      const path = `/api/v${this.#options.version}/${preparedRequest.path.replace(/^\/+/, "")}`;

      // Build request headers with authentication and content type
      const headers = this.#buildRequestHeaders(preparedRequest);

      // Format query parameters with boolean value handling
      const query = preparedRequest.query
        ? this.#formatBooleanQueryParams(preparedRequest.query)
        : undefined;

      // Execute the HTTP request through the connection pool
      const response = await this.pool.request<T>({
        path,
        method: preparedRequest.method,
        body: preparedRequest.body,
        query: query,
        signal: controller.signal,
        headers: headers,
      });

      // Process response body with optimized buffer handling
      let responseBody: Buffer;
      const arrayBuffer = await response.body.arrayBuffer();

      // Optimize buffer allocation based on response size
      if (arrayBuffer.byteLength < 4096) {
        // Small response optimization
        responseBody = Buffer.allocUnsafe(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        responseBody.set(view);
      } else {
        // Large response handling
        responseBody = Buffer.from(arrayBuffer);
      }

      // Handle empty responses (204 No Content or empty body)
      if (response.statusCode === 204 || responseBody.length === 0) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
        };
      }

      // Parse JSON response body
      const result: T = JSON.parse(responseBody.toString());

      // Extract error details for failed API responses
      let reason: string | undefined;
      if (response.statusCode >= 400 && this.#isJsonErrorEntity(result)) {
        const jsonError = result as JsonErrorResponse;
        const formattedFieldErrors = this.#formatFieldErrors(jsonError.errors);
        reason = formattedFieldErrors
          ? `${jsonError.message}. Details: ${formattedFieldErrors}`
          : jsonError.message;
      }

      // Calculate request duration for performance monitoring
      const duration = Date.now() - requestStart;

      // Emit request completion event for observability
      this.emit("request", {
        timestamp: new Date().toISOString(),
        requestId,
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        duration,
        responseSize: responseBody.length,
      });

      // Return normalized response object
      return {
        data: result,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        reason,
      };
    } catch (error) {
      // Handle timeout errors with specific messaging
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Request timed out after ${this.#options.timeout}ms [${options.method} ${options.path}]`,
        );
      }

      // Re-throw other errors for retry handling
      throw error;
    } finally {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeout);
    }
  }

  /**
   * Validates whether an object follows Discord's API error response structure.
   * Used to identify and properly handle structured API errors vs generic failures.
   *
   * @param error - Object to validate for error structure
   * @returns Type predicate indicating if object is a Discord API error
   *
   * @internal
   */
  #isJsonErrorEntity(error: unknown): error is JsonErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number" &&
      "message" in error &&
      typeof error.message === "string"
    );
  }

  /**
   * Constructs HTTP headers for Discord API requests.
   * Handles authentication, content type detection, and custom header merging
   * with proper content-length calculation for different body types.
   *
   * @param options - Request options containing optional headers and body
   * @returns Complete headers object ready for HTTP request
   *
   * @internal
   */
  #buildRequestHeaders(options: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "x-ratelimit-precision": "millisecond",
    };

    // Handle content type and length based on request body type
    if (options.body && !options.files) {
      if (typeof options.body === "string") {
        headers["content-length"] = Buffer.byteLength(
          options.body,
          "utf8",
        ).toString();
        headers["content-type"] = "application/json";
      } else if (Buffer.isBuffer(options.body)) {
        headers["content-length"] = options.body.length.toString();
        headers["content-type"] = "application/json";
      }
      // Note: Undici handles Content-Length for streams automatically
    }

    // Merge custom headers from request options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add audit log reason header if provided
    if (options.reason) {
      Object.assign(headers, {
        "x-audit-log-reason": encodeURIComponent(options.reason),
      });
    }

    return headers;
  }

  /**
   * Prepares multipart/form-data requests for file uploads.
   * Integrates with FileHandler to create properly formatted multipart requests
   * with files and JSON payload data.
   *
   * @param options - Request options containing files to upload
   * @returns Promise resolving to prepared request with multipart body
   *
   * @internal
   */
  async #handleFileUpload(
    options: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    // Create multipart form data with files and payload
    const formData = await this.file.createFormData(
      options.files,
      options.body,
    );

    return {
      ...options,
      body: formData.getBuffer(),
      headers: formData.getHeaders(options.headers),
    };
  }

  /**
   * Formats boolean query parameters for Discord API compatibility.
   * Converts JavaScript boolean values to string representations that
   * Discord's API expects for proper query parameter handling.
   *
   * @param params - Query parameters object containing mixed types
   * @returns Formatted parameters with boolean values as strings
   *
   * @internal
   */
  #formatBooleanQueryParams(params: object): object {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "boolean") {
        // Discord API expects boolean values as strings
        result[key] = value ? "true" : "false";
      } else if (value !== undefined && value !== null) {
        result[key] = String(value);
      }
    }

    return result;
  }

  /**
   * Formats nested field validation errors into readable error messages.
   * Recursively processes Discord's nested error structure to create
   * user-friendly descriptions of validation failures.
   *
   * @param errors - Nested error object from Discord API response
   * @returns Formatted error string or undefined if no errors
   *
   * @internal
   */
  #formatFieldErrors(errors?: Record<string, unknown>): string | undefined {
    if (!errors) {
      return undefined;
    }

    const errorParts: string[] = [];

    // Recursive function to handle nested error structures
    const processErrors = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === "_errors" && Array.isArray(value) && value.length > 0) {
          // Extract error messages from _errors arrays
          const fieldErrors = value
            .map((err: JsonErrorField) => `"${err.message}"`)
            .join(", ");
          errorParts.push(`${path || "general"}: ${fieldErrors}`);
        } else if (value && typeof value === "object") {
          // Recursively process nested objects
          processErrors(value as Record<string, unknown>, currentPath);
        }
      }
    };

    processErrors(errors);
    return errorParts.length > 0 ? errorParts.join("; ") : undefined;
  }

  /**
   * Extracts resource type information from Discord API paths.
   * Analyzes URL patterns to identify the type of resource being accessed
   * for enhanced error messaging and debugging context.
   *
   * @param path - API path to analyze for resource type
   * @returns Resource type string or undefined if not identifiable
   *
   * @internal
   */
  #extractResourceType(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    // Match common Discord resource patterns
    const matches = path.match(/\/([a-z-]+)\/\d+/i);
    return matches?.[1];
  }

  /**
   * Extracts resource ID (Discord snowflake) from API paths.
   * Identifies the specific entity ID being accessed for error context
   * and debugging information.
   *
   * @param path - API path to analyze for resource ID
   * @returns Resource ID string or undefined if not found
   *
   * @internal
   */
  #extractResourceId(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    // Extract the last snowflake ID in the path
    const matches = path.match(/\/([0-9]+)(?:\/[a-z-]+)*\/?$/i);
    return matches?.[1];
  }
}
