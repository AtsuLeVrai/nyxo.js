import type {
  AllowedMentionsEntity,
  MessageEntity,
  Snowflake,
  WebhookEntity,
} from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export interface WebhookCreate extends Pick<WebhookEntity, "name"> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface WebhookModify
  extends Partial<Pick<WebhookEntity, "name" | "channel_id">> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export interface WebhookExecute
  extends Pick<
    MessageEntity,
    "content" | "tts" | "embeds" | "components" | "flags" | "poll"
  > {
  username?: string;
  avatar_url?: string;
  allowed_mentions?: AllowedMentionsEntity;
  thread_name?: string;
  applied_tags?: Snowflake[];
}

export class WebhookRouter extends Router {
  static routes = {
    channelWebhooks: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/webhooks` => {
      return `/channels/${channelId}/webhooks` as const;
    },
    guildWebhooks: (guildId: Snowflake): `/guilds/${Snowflake}/webhooks` => {
      return `/guilds/${guildId}/webhooks` as const;
    },
    webhook: (webhookId: Snowflake): `/webhooks/${Snowflake}` => {
      return `/webhooks/${webhookId}` as const;
    },
    webhookWithToken: (
      webhookId: Snowflake,
      token: string,
    ): `/webhooks/${Snowflake}/${string}` => {
      return `/webhooks/${webhookId}/${token}` as const;
    },
    webhookMessage: (
      webhookId: Snowflake,
      token: string,
      messageId: Snowflake,
    ): `/webhooks/${Snowflake}/${string}/messages/${Snowflake}` => {
      return `/webhooks/${webhookId}/${token}/messages/${messageId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  createWebhook(
    channelId: Snowflake,
    options: WebhookCreate,
    reason?: string,
  ): Promise<WebhookEntity> {
    return this.post(WebhookRouter.routes.channelWebhooks(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  getChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.get(WebhookRouter.routes.channelWebhooks(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  getGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.get(WebhookRouter.routes.guildWebhooks(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  getWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.get(WebhookRouter.routes.webhook(webhookId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  getWebhookWithToken(
    webhookId: Snowflake,
    token: string,
  ): Promise<WebhookEntity> {
    return this.get(WebhookRouter.routes.webhookWithToken(webhookId, token));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   */
  modifyWebhook(
    webhookId: Snowflake,
    options: WebhookModify,
    reason?: string,
  ): Promise<WebhookEntity> {
    return this.patch(WebhookRouter.routes.webhook(webhookId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  modifyWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    options: Omit<WebhookModify, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    return this.patch(WebhookRouter.routes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhook(webhookId: Snowflake, reason?: string): Promise<void> {
    return this.delete(WebhookRouter.routes.webhook(webhookId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
   */
  deleteWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      WebhookRouter.routes.webhookWithToken(webhookId, token),
      {
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   */
  executeWebhook(
    webhookId: Snowflake,
    token: string,
    options: WebhookExecute & { wait?: boolean; thread_id?: Snowflake },
  ): Promise<WebhookEntity | undefined> {
    return this.post(WebhookRouter.routes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(options),
      query: {
        wait: options.wait,
        thread_id: options.thread_id,
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   */
  getWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    threadId?: Snowflake,
  ): Promise<WebhookEntity> {
    return this.get(
      WebhookRouter.routes.webhookMessage(webhookId, token, messageId),
      {
        query: { thread_id: threadId },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  editWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    options: Partial<WebhookExecute> & { thread_id?: Snowflake },
  ): Promise<WebhookEntity> {
    return this.patch(
      WebhookRouter.routes.webhookMessage(webhookId, token, messageId),
      {
        body: JSON.stringify(options),
        query: { thread_id: options.thread_id },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
   */
  deleteWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    threadId?: Snowflake,
  ): Promise<void> {
    return this.delete(
      WebhookRouter.routes.webhookMessage(webhookId, token, messageId),
      {
        query: { thread_id: threadId },
      },
    );
  }
}
