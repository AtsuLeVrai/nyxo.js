import { BaseRouter } from "../../bases/index.js";
import type { FileInput } from "../../core/index.js";
import type {
  MessageCreateV1Options,
  MessageCreateV2Options,
  MessageEntity,
} from "../message/index.js";
import type { AnyWebhookEntity, IncomingWebhookEntity } from "./webhook.entity.js";

export interface RestWebhookCreateOptions {
  name: string;
  avatar?: FileInput | null;
}

export interface RestWebhookUpdateOptions {
  name?: string;
  avatar?: FileInput | null;
  channel_id?: string | null;
}

export interface RestWebhookExecuteParams {
  wait?: boolean;
  thread_id?: string;
}

export type RestWebhookExecuteOptions = {
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

export type RestWebhookMessageEditOptions =
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

export const WebhookRoutes = {
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

export class WebhookRouter extends BaseRouter {
  async createWebhook(
    channelId: string,
    options: RestWebhookCreateOptions,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.post(WebhookRoutes.channelWebhooksEndpoint(channelId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  fetchChannelWebhooks(channelId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.channelWebhooksEndpoint(channelId));
  }

  fetchGuildWebhooks(guildId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.guildWebhooksEndpoint(guildId));
  }

  fetchWebhook(webhookId: string): Promise<AnyWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhookByIdEndpoint(webhookId));
  }

  fetchWebhookWithToken(webhookId: string, token: string): Promise<IncomingWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhookWithTokenEndpoint(webhookId, token));
  }

  async updateWebhook(
    webhookId: string,
    options: RestWebhookUpdateOptions,
    reason?: string,
  ): Promise<AnyWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.webhookByIdEndpoint(webhookId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  async updateWebhookWithToken(
    webhookId: string,
    token: string,
    options: Omit<RestWebhookUpdateOptions, "channel_id">,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.webhookWithTokenEndpoint(webhookId, token), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  deleteWebhook(webhookId: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookByIdEndpoint(webhookId), {
      reason,
    });
  }

  deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookWithTokenEndpoint(webhookId, token), {
      reason,
    });
  }

  sendWebhook(
    webhookId: string,
    token: string,
    options: RestWebhookExecuteOptions,
    query?: RestWebhookExecuteParams,
  ): Promise<MessageEntity | undefined> {
    const { files, ...rest } = options;
    return this.rest.post(WebhookRoutes.webhookWithTokenEndpoint(webhookId, token), {
      body: JSON.stringify(rest),
      files,
      query,
    });
  }

  sendSlackWebhook(
    webhookId: string,
    token: string,
    query?: RestWebhookExecuteParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.slackWebhookEndpoint(webhookId, token), {
      query,
    });
  }

  sendGithubWebhook(
    webhookId: string,
    token: string,
    query?: RestWebhookExecuteParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.githubWebhookEndpoint(webhookId, token), {
      query,
    });
  }

  fetchWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    threadId?: string,
  ): Promise<MessageEntity> {
    return this.rest.get(WebhookRoutes.webhookMessageEndpoint(webhookId, token, messageId), {
      query: threadId ? { thread_id: threadId } : undefined,
    });
  }

  updateWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    options: RestWebhookMessageEditOptions,
    threadId?: string,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.rest.patch(WebhookRoutes.webhookMessageEndpoint(webhookId, token, messageId), {
      body: JSON.stringify(rest),
      files,
      query: threadId ? { thread_id: threadId } : undefined,
    });
  }

  deleteWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    threadId?: string,
  ): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookMessageEndpoint(webhookId, token, messageId), {
      query: threadId ? { thread_id: threadId } : undefined,
    });
  }
}
