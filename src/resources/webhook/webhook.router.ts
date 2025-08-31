import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DeepNonNullable, DeepNullable } from "../../utils/index.js";
import type {
  MessageEntity,
  RESTCreateMessageJSONParams,
  RESTCreateMessageV1JSONParams,
  RESTCreateMessageV2JSONParams,
} from "../message/index.js";
import type {
  AnyWebhookEntity,
  ChannelFollowerWebhookEntity,
  IncomingWebhookEntity,
} from "./webhook.entity.js";

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

export class WebhookRouter extends BaseRouter {
  async createWebhook(
    channelId: string,
    options: RESTCreateWebhookJSONParams,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.post(WebhookRoutes.channelWebhooks(channelId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  getChannelWebhooks(channelId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.channelWebhooks(channelId));
  }

  getGuildWebhooks(guildId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.guildWebhooks(guildId));
  }

  getWebhook(webhookId: string): Promise<AnyWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhook(webhookId));
  }

  getWebhookWithToken(webhookId: string, token: string): Promise<IncomingWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhookWithToken(webhookId, token));
  }

  async modifyWebhook(
    webhookId: string,
    options: RESTWebhookUpdateJSONParams,
    reason?: string,
  ): Promise<AnyWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.webhook(webhookId), {
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
    return this.rest.patch(WebhookRoutes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  deleteWebhook(webhookId: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhook(webhookId), {
      reason,
    });
  }

  deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookWithToken(webhookId, token), {
      reason,
    });
  }

  async executeWebhook(
    webhookId: string,
    token: string,
    options: RESTWebhookExecuteJSONParams,
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<MessageEntity | undefined> {
    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.post(WebhookRoutes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(rest),
      files,
      query,
    });
  }

  executeSlackWebhook(
    webhookId: string,
    token: string,
    options: any, // Slack format is different from Discord format
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.slackWebhook(webhookId, token), {
      body: JSON.stringify(options),
      query,
    });
  }

  executeGithubWebhook(
    webhookId: string,
    token: string,
    options: any, // GitHub format is different from Discord format
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.githubWebhook(webhookId, token), {
      body: JSON.stringify(options),
      query,
    });
  }

  getWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<MessageEntity> {
    return this.rest.get(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      query,
    });
  }

  async editWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    options: RESTWebhookMessageEditJSONParams,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<MessageEntity> {
    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.patch(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      body: JSON.stringify(rest),
      files: files as FileInput[] | undefined,
      query,
    });
  }

  deleteWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      query,
    });
  }
}
