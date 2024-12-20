import type {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  Snowflake,
  WebhookEntity,
} from "@nyxjs/core";
import type { FileEntity, ImageData } from "../types/index.js";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export interface WebhookCreateEntity extends Pick<WebhookEntity, "name"> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface WebhookModifyEntity
  extends Partial<Pick<WebhookEntity, "name" | "channel_id">> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export interface WebhookExecuteEntity
  extends Pick<
    MessageEntity,
    "content" | "tts" | "embeds" | "components" | "flags" | "poll"
  > {
  username?: string;
  avatar_url?: string;
  allowed_mentions?: AllowedMentionsEntity;
  files?: FileEntity[];
  payload_json?: string;
  attachments?: Partial<AttachmentEntity>[];
  thread_name?: string;
  applied_tags?: Snowflake[];
}

export interface WebhookExecuteOptionsEntity extends WebhookExecuteEntity {
  wait?: boolean;
  thread_id?: Snowflake;
}

export interface EditWebhookMessageOptionsEntity
  extends Partial<WebhookExecuteEntity> {
  thread_id?: Snowflake;
}

export class WebhookRouter extends BaseRouter {
  static readonly NAME_MIN_LENGTH = 1;
  static readonly NAME_MAX_LENGTH = 80;
  static readonly CONTENT_MAX_LENGTH = 2000;
  static readonly EMBEDS_MAX = 10;
  static readonly EMBEDS_TOTAL_CHARS = 6000;
  static readonly INVALID_USERNAME_SUBSTRINGS = ["clyde", "discord"];

  static readonly routes = {
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
    options: WebhookCreateEntity,
    reason?: string,
  ): Promise<WebhookEntity> {
    this.validateWebhookName(options.name);

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
    options: WebhookModifyEntity,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.name) {
      this.validateWebhookName(options.name);
    }

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
    options: Omit<WebhookModifyEntity, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.name) {
      this.validateWebhookName(options.name);
    }

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
    options: WebhookExecuteOptionsEntity,
  ): Promise<WebhookEntity | undefined> {
    this.validateContent(options.content);
    this.validateEmbeds(options.embeds);

    const hasContent = Boolean(
      options.content ||
        options.embeds?.length > 0 ||
        (options.files && options.files.length > 0) ||
        options.poll,
    );
    if (!hasContent) {
      throw new Error(
        "At least one of content, embeds, files or poll must be provided",
      );
    }

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
    options: EditWebhookMessageOptionsEntity,
  ): Promise<WebhookEntity> {
    this.validateContent(options.content);
    this.validateEmbeds(options.embeds);

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

  validateWebhookName(name?: string | null): void {
    if (!name) {
      return;
    }

    const webhookName = name.trim();
    if (
      webhookName.length < WebhookRouter.NAME_MIN_LENGTH ||
      webhookName.length > WebhookRouter.NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Webhook name must be between ${WebhookRouter.NAME_MIN_LENGTH} and ${WebhookRouter.NAME_MAX_LENGTH} characters`,
      );
    }

    const lowerName = webhookName.toLowerCase();
    if (
      WebhookRouter.INVALID_USERNAME_SUBSTRINGS.some((sub) =>
        lowerName.includes(sub),
      )
    ) {
      throw new Error("Webhook name contains forbidden words (clyde, discord)");
    }
  }

  validateContent(content?: string): void {
    if (content && content.length > WebhookRouter.CONTENT_MAX_LENGTH) {
      throw new Error(
        `Content cannot exceed ${WebhookRouter.CONTENT_MAX_LENGTH} characters`,
      );
    }
  }

  validateEmbeds(embeds?: EmbedEntity[]): void {
    if (embeds) {
      if (embeds.length > WebhookRouter.EMBEDS_MAX) {
        throw new Error(
          `Cannot have more than ${WebhookRouter.EMBEDS_MAX} embeds`,
        );
      }

      const totalChars = embeds.reduce(
        (acc, embed) => acc + JSON.stringify(embed).length,
        0,
      );
      if (totalChars > WebhookRouter.EMBEDS_TOTAL_CHARS) {
        throw new Error(
          `Total embed characters cannot exceed ${WebhookRouter.EMBEDS_TOTAL_CHARS}`,
        );
      }
    }
  }
}
