import type { FileInput, Rest } from "../../core/index.js";
import type {
  MessageCreateV1Options,
  MessageCreateV2Options,
  MessageEntity,
} from "../message/index.js";
import type { WebhookEntity } from "./webhook.entity.js";

export interface WebhookCreateOptions {
  name: string;
  avatar?: FileInput | null;
}

export interface WebhookUpdateOptions {
  name?: string;
  avatar?: FileInput | null;
  channel_id?: string | null;
}

export interface WebhookExecuteParams {
  wait?: boolean;
  thread_id?: string;
}

export type WebhookExecuteOptions = {
  username?: string;
  avatar_url?: string;
  thread_name?: string;
  applied_tags?: string[];
} & (
  | Pick<
      MessageCreateV1Options,
      | "content"
      | "tts"
      | "embeds"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
      | "flags"
      | "poll"
    >
  | Pick<
      MessageCreateV2Options,
      "tts" | "allowed_mentions" | "components" | "files" | "payload_json" | "attachments" | "flags"
    >
);

export type WebhookMessageFetchParams = Pick<WebhookExecuteParams, "thread_id">;

export type WebhookMessageEditOptions =
  | Pick<
      MessageCreateV1Options,
      | "content"
      | "embeds"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
      | "poll"
    >
  | Pick<
      MessageCreateV2Options,
      "allowed_mentions" | "components" | "files" | "payload_json" | "attachments" | "flags"
    >;

export class WebhookRouter {
  static readonly Routes = {
    channelWebhooksEndpoint: (channelId: string) => `/channels/${channelId}/webhooks` as const,
    guildWebhooksEndpoint: (guildId: string) => `/guilds/${guildId}/webhooks` as const,
    webhookByIdEndpoint: (webhookId: string) => `/webhooks/${webhookId}` as const,
    webhookWithTokenEndpoint: (webhookId: string, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,
    slackWebhookEndpoint: (webhookId: string, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,
    githubWebhookEndpoint: (webhookId: string, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,
    webhookMessageEndpoint: (webhookId: string, token: string, messageId: string) =>
      `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  async createWebhook(
    channelId: string,
    options: WebhookCreateOptions,
    reason?: string,
  ): Promise<WebhookEntity> {
    const processedOptions = { ...options };
    if (processedOptions.avatar) {
      processedOptions.avatar = await this.#rest.toDataUri(processedOptions.avatar);
    }
    return this.#rest.post(WebhookRouter.Routes.channelWebhooksEndpoint(channelId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  fetchChannelWebhooks(channelId: string): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookRouter.Routes.channelWebhooksEndpoint(channelId));
  }
  fetchGuildWebhooks(guildId: string): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookRouter.Routes.guildWebhooksEndpoint(guildId));
  }
  fetchWebhook(webhookId: string): Promise<WebhookEntity> {
    return this.#rest.get(WebhookRouter.Routes.webhookByIdEndpoint(webhookId));
  }
  fetchWebhookWithToken(webhookId: string, token: string): Promise<WebhookEntity> {
    return this.#rest.get(WebhookRouter.Routes.webhookWithTokenEndpoint(webhookId, token));
  }
  async updateWebhook(
    webhookId: string,
    options: WebhookUpdateOptions,
    reason?: string,
  ): Promise<WebhookEntity> {
    const processedOptions = { ...options };
    if (processedOptions.avatar) {
      processedOptions.avatar = await this.#rest.toDataUri(processedOptions.avatar);
    }
    return this.#rest.patch(WebhookRouter.Routes.webhookByIdEndpoint(webhookId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  async updateWebhookWithToken(
    webhookId: string,
    token: string,
    options: Omit<WebhookUpdateOptions, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    const processedOptions = { ...options };
    if (processedOptions.avatar) {
      processedOptions.avatar = await this.#rest.toDataUri(processedOptions.avatar);
    }
    return this.#rest.patch(WebhookRouter.Routes.webhookWithTokenEndpoint(webhookId, token), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  deleteWebhook(webhookId: string, reason?: string): Promise<void> {
    return this.#rest.delete(WebhookRouter.Routes.webhookByIdEndpoint(webhookId), {
      reason,
    });
  }
  deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<void> {
    return this.#rest.delete(WebhookRouter.Routes.webhookWithTokenEndpoint(webhookId, token), {
      reason,
    });
  }
  sendWebhook(
    webhookId: string,
    token: string,
    options: WebhookExecuteOptions,
    query?: WebhookExecuteParams,
  ): Promise<MessageEntity | undefined> {
    const { files, ...rest } = options;
    return this.#rest.post(WebhookRouter.Routes.webhookWithTokenEndpoint(webhookId, token), {
      body: JSON.stringify(rest),
      files,
      query,
    });
  }
  sendSlackWebhook(webhookId: string, token: string, query?: WebhookExecuteParams): Promise<void> {
    return this.#rest.post(WebhookRouter.Routes.slackWebhookEndpoint(webhookId, token), {
      query,
    });
  }
  sendGithubWebhook(webhookId: string, token: string, query?: WebhookExecuteParams): Promise<void> {
    return this.#rest.post(WebhookRouter.Routes.githubWebhookEndpoint(webhookId, token), {
      query,
    });
  }
  fetchWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: WebhookMessageFetchParams,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      WebhookRouter.Routes.webhookMessageEndpoint(webhookId, token, messageId),
      { query },
    );
  }
  updateWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    options: WebhookMessageEditOptions,
    query?: WebhookMessageFetchParams,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      WebhookRouter.Routes.webhookMessageEndpoint(webhookId, token, messageId),
      { body: JSON.stringify(rest), files, query },
    );
  }
  deleteWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: WebhookMessageFetchParams,
  ): Promise<void> {
    return this.#rest.delete(
      WebhookRouter.Routes.webhookMessageEndpoint(webhookId, token, messageId),
      { query },
    );
  }
}
