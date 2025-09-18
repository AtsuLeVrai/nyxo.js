export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

export interface WebhookEntity {
  id: string;
  type: WebhookType;
  guild_id?: string | null;
  channel_id: string | null;
  user?: UserEntity | null;
  name?: string | null;
  avatar?: string | null;
  token?: string;
  application_id: string | null;
  source_guild?: Partial<GuildEntity> | null;
  source_channel?: AnyChannelEntity | null;
  url?: string;
}

export interface IncomingWebhookEntity
  extends Omit<WebhookEntity, "source_guild" | "source_channel"> {
  type: WebhookType.Incoming;
}

export interface ChannelFollowerWebhookEntity extends Omit<WebhookEntity, "token" | "url"> {
  type: WebhookType.ChannelFollower;
  guild_id: string;
  channel_id: string;
}

export interface ApplicationWebhookEntity extends Pick<WebhookEntity, "id" | "name" | "avatar"> {
  type: WebhookType.Application;
  application_id: string;
}

export type AnyWebhookEntity =
  | IncomingWebhookEntity
  | ChannelFollowerWebhookEntity
  | ApplicationWebhookEntity;

export type GatewayWebhooksUpdateEntity = Required<
  DeepNonNullable<
    Pick<Exclude<AnyWebhookEntity, ApplicationWebhookEntity>, "guild_id" | "channel_id">
  >
>;

export interface RESTCreateWebhookJSONParams
  extends Required<DeepNonNullable<Pick<AnyWebhookEntity, "name">>> {
  avatar?: FileInput | null;
}

export type RESTWebhookUpdateJSONParams = Partial<
  RESTCreateWebhookJSONParams & Pick<ChannelFollowerWebhookEntity, "channel_id">
>;

export interface RESTWebhookExecuteQueryStringParams {
  wait?: boolean;
  thread_id?: string;
}

export type RESTWebhookExecuteJSONParams = RESTCreateMessageJSONParams & {
  username?: string;
  avatar_url?: string;
  thread_name?: string;
  applied_tags?: string[];
};

export type RESTWebhookMessageEditJSONParams =
  | Partial<
      DeepNullable<
        Pick<
          RESTCreateMessageV1JSONParams,
          | "content"
          | "embeds"
          | "flags"
          | "allowed_mentions"
          | "components"
          | "files"
          | "payload_json"
          | "attachments"
        >
      >
    >
  | Partial<
      DeepNullable<
        Pick<
          RESTCreateMessageV2JSONParams,
          "allowed_mentions" | "files" | "payload_json" | "attachments" | "components" | "flags"
        >
      >
    >;

export interface RESTWebhookMessageQueryStringParams {
  thread_id?: string;
}

export const WebhookRoutes = {
  channelWebhooks: (channelId: string) => `/channels/${channelId}/webhooks` as const,
  guildWebhooks: (guildId: string) => `/guilds/${guildId}/webhooks` as const,
  webhook: (webhookId: string) => `/webhooks/${webhookId}` as const,
  webhookWithToken: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}` as const,
  slackWebhook: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/slack` as const,
  githubWebhook: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/github` as const,
  webhookMessage: (webhookId: string, token: string, messageId: string) =>
    `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
} as const satisfies RouteBuilder;
