import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { StripNull } from "../../utils/index.js";
import type {
  MessageCreateV1Options,
  MessageCreateV2Options,
  MessageEntity,
} from "../message/index.js";
import type {
  AnyWebhookEntity,
  ChannelFollowerWebhookEntity,
  IncomingWebhookEntity,
} from "./webhook.entity.js";

export interface RESTCreateWebhookJSONParams
  extends Required<StripNull<Pick<AnyWebhookEntity, "name">>> {
  avatar?: FileInput | null;
}

export type RESTWebhookUpdateJSONParams = Partial<
  RESTCreateWebhookJSONParams & Pick<ChannelFollowerWebhookEntity, "channel_id">
>;

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
  getChannelWebhooks: (channelId: string) => `/channels/${channelId}/webhooks` as const,
  getGuildWebhooks: (guildId: string) => `/guilds/${guildId}/webhooks` as const,
  getWebhook: (webhookId: string) => `/webhooks/${webhookId}` as const,
  getWebhookWithToken: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}` as const,
  slackWebhookEndpoint: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/slack` as const,
  githubWebhookEndpoint: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/github` as const,
  webhookMessageEndpoint: (webhookId: string, token: string, messageId: string) =>
    `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
} as const satisfies RouteBuilder;

export class WebhookRouter extends BaseRouter {
  async createWebhook(
    channelId: string,
    options: RESTCreateWebhookJSONParams,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.post(WebhookRoutes.getChannelWebhooks(channelId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  getChannelWebhooks(channelId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.getChannelWebhooks(channelId));
  }

  getGuildWebhooks(guildId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.getGuildWebhooks(guildId));
  }

  getWebhook(webhookId: string): Promise<AnyWebhookEntity> {
    return this.rest.get(WebhookRoutes.getWebhook(webhookId));
  }

  getWebhookWithToken(webhookId: string, token: string): Promise<IncomingWebhookEntity> {
    return this.rest.get(WebhookRoutes.getWebhookWithToken(webhookId, token));
  }

  async modifyWebhook(
    webhookId: string,
    options: RESTWebhookUpdateJSONParams,
    reason?: string,
  ): Promise<AnyWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.getWebhook(webhookId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  async modifyWebhookWithToken(
    webhookId: string,
    token: string,
    options: Omit<RESTWebhookUpdateJSONParams, "channel_id">,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.getWebhookWithToken(webhookId, token), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  deleteWebhook(webhookId: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.getWebhook(webhookId), {
      reason,
    });
  }

  deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.getWebhookWithToken(webhookId, token), {
      reason,
    });
  }

  executeWebhook(
    webhookId: string,
    token: string,
    options: RestWebhookExecuteOptions,
    query?: RestWebhookExecuteParams,
  ): Promise<MessageEntity | undefined> {
    const { files, ...rest } = options;
    return this.rest.post(WebhookRoutes.getWebhookWithToken(webhookId, token), {
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
