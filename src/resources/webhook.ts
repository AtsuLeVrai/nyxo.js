import type { Snowflake } from "../common/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { AnyChannelObject } from "./channel.js";
import type { ActionRowComponentObject } from "./components.js";
import type { GuildObject } from "./guild.js";
import type {
  AllowedMentionsObject,
  AttachmentObject,
  EmbedObject,
  MessageFlags,
  MessageObject,
} from "./message.js";
import type { PollCreateRequestObject } from "./poll.js";
import type { UserObject } from "./user.js";

export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

export interface WebhookObject {
  id: Snowflake;
  type: WebhookType;
  guild_id?: Snowflake | null;
  channel_id: Snowflake | null;
  user?: UserObject;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: Snowflake | null;
  source_guild?: Partial<GuildObject>;
  source_channel?: Partial<AnyChannelObject>;
  url?: string;
}

export interface IncomingWebhookObject
  extends Omit<WebhookObject, "type" | "source_guild" | "source_channel"> {
  type: WebhookType.Incoming;
}

export interface ChannelFollowerWebhookObject
  extends Omit<WebhookObject, "type" | "token" | "url"> {
  type: WebhookType.ChannelFollower;
}

export interface ApplicationWebhookObject
  extends Pick<WebhookObject, "id" | "name" | "avatar" | "application_id"> {
  type: WebhookType.Application;
}

export type AnyWebhookObject =
  | IncomingWebhookObject
  | ChannelFollowerWebhookObject
  | ApplicationWebhookObject;

// Webhook Request/Response Interfaces
export interface CreateWebhookRequest {
  name: string;
  avatar?: DataUri | null;
}

export interface ModifyWebhookRequest {
  name?: string;
  avatar?: DataUri | null;
  channel_id?: Snowflake;
}

export interface ModifyWebhookWithTokenRequest {
  name?: string;
  avatar?: DataUri | null;
}

export interface ExecuteWebhookRequest {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: EmbedObject[];
  allowed_mentions?: AllowedMentionsObject;
  components?: ActionRowComponentObject[];
  files?: File[];
  payload_json?: string;
  attachments?: Partial<AttachmentObject>[];
  flags?: MessageFlags;
  thread_name?: string;
  applied_tags?: Snowflake[];
  poll?: PollCreateRequestObject;
}

export interface ExecuteWebhookQuery {
  wait?: boolean;
  thread_id?: Snowflake;
  with_components?: boolean;
}

export interface EditWebhookMessageRequest {
  content?: string | null;
  embeds?: EmbedObject[] | null;
  flags?: MessageFlags;
  allowed_mentions?: AllowedMentionsObject | null;
  components?: ActionRowComponentObject[] | null;
  files?: File[];
  payload_json?: string;
  attachments?: Partial<AttachmentObject>[];
  poll?: PollCreateRequestObject | null;
}

export interface EditWebhookMessageQuery {
  thread_id?: Snowflake;
  with_components?: boolean;
}

export interface WebhookMessageQuery {
  thread_id?: Snowflake;
}

export interface SlackWebhookQuery {
  thread_id?: Snowflake;
  wait?: boolean;
}

export interface GitHubWebhookQuery {
  thread_id?: Snowflake;
  wait?: boolean;
}

export const WebhookRoutes = {
  // POST /channels/{channel.id}/webhooks - Create Webhook
  createWebhook: ((channelId: Snowflake) => `/channels/${channelId}/webhooks`) as EndpointFactory<
    `/channels/${string}/webhooks`,
    ["POST"],
    WebhookObject,
    true,
    false,
    CreateWebhookRequest
  >,

  // GET /channels/{channel.id}/webhooks - Get Channel Webhooks
  getChannelWebhooks: ((channelId: Snowflake) =>
    `/channels/${channelId}/webhooks`) as EndpointFactory<
    `/channels/${string}/webhooks`,
    ["GET"],
    WebhookObject[]
  >,

  // GET /guilds/{guild.id}/webhooks - Get Guild Webhooks
  getGuildWebhooks: ((guildId: Snowflake) => `/guilds/${guildId}/webhooks`) as EndpointFactory<
    `/guilds/${string}/webhooks`,
    ["GET"],
    WebhookObject[]
  >,

  // GET /webhooks/{webhook.id} - Get Webhook
  getWebhook: ((webhookId: Snowflake) => `/webhooks/${webhookId}`) as EndpointFactory<
    `/webhooks/${string}`,
    ["GET", "PATCH", "DELETE"],
    WebhookObject,
    true,
    false,
    ModifyWebhookRequest
  >,

  // GET /webhooks/{webhook.id}/{webhook.token} - Get Webhook with Token
  getWebhookWithToken: ((webhookId: Snowflake, webhookToken: string) =>
    `/webhooks/${webhookId}/${webhookToken}`) as EndpointFactory<
    `/webhooks/${string}/${string}`,
    ["GET", "PATCH", "DELETE", "POST"],
    WebhookObject,
    true,
    false,
    ModifyWebhookWithTokenRequest | ExecuteWebhookRequest,
    ExecuteWebhookQuery
  >,

  // GET /webhooks/{webhook.id}/{webhook.token}/messages/{message.id} - Get Webhook Message
  getWebhookMessage: ((webhookId: Snowflake, webhookToken: string, messageId: Snowflake) =>
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`) as EndpointFactory<
    `/webhooks/${string}/${string}/messages/${string}`,
    ["GET", "PATCH", "DELETE"],
    MessageObject,
    false,
    false,
    EditWebhookMessageRequest,
    EditWebhookMessageQuery | WebhookMessageQuery
  >,

  // POST /webhooks/{webhook.id}/{webhook.token}/slack - Execute Slack-Compatible Webhook
  executeSlackWebhook: ((webhookId: Snowflake, webhookToken: string) =>
    `/webhooks/${webhookId}/${webhookToken}/slack`) as EndpointFactory<
    `/webhooks/${string}/${string}/slack`,
    ["POST"],
    MessageObject | undefined,
    false,
    false,
    any, // Slack payload format
    SlackWebhookQuery
  >,

  // POST /webhooks/{webhook.id}/{webhook.token}/github - Execute GitHub-Compatible Webhook
  executeGitHubWebhook: ((webhookId: Snowflake, webhookToken: string) =>
    `/webhooks/${webhookId}/${webhookToken}/github`) as EndpointFactory<
    `/webhooks/${string}/${string}/github`,
    ["POST"],
    MessageObject | undefined,
    false,
    false,
    any, // GitHub payload format
    GitHubWebhookQuery
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
