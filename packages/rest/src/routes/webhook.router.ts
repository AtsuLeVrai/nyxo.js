import type { Snowflake, WebhookEntity } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateWebhookEntity,
  EditWebhookMessageEntity,
  ExecuteWebhookEntity,
  ExecuteWebhookQueryEntity,
  GetWebhookMessageQueryEntity,
  ModifyWebhookEntity,
} from "../schemas/index.js";

export class WebhookRouter {
  static readonly ROUTES = {
    channelWebhooks: (channelId: Snowflake) =>
      `/channels/${channelId}/webhooks` as const,
    guildWebhooks: (guildId: Snowflake) =>
      `/guilds/${guildId}/webhooks` as const,
    webhook: (webhookId: Snowflake) => `/webhooks/${webhookId}` as const,
    webhookWithToken: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,
    webhookWithTokenSlack: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,
    webhookWithTokenGithub: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,
    webhookMessage: (
      webhookId: Snowflake,
      token: string,
      messageId: Snowflake,
    ) => `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  createWebhook(
    channelId: Snowflake,
    options: z.input<typeof CreateWebhookEntity>,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = CreateWebhookEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(WebhookRouter.ROUTES.channelWebhooks(channelId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  getChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookRouter.ROUTES.channelWebhooks(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  getGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookRouter.ROUTES.guildWebhooks(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  getWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.#rest.get(WebhookRouter.ROUTES.webhook(webhookId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  getWebhookWithToken(
    webhookId: Snowflake,
    token: string,
  ): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookRouter.ROUTES.webhookWithToken(webhookId, token),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   */
  modifyWebhook(
    webhookId: Snowflake,
    options: z.input<typeof ModifyWebhookEntity>,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = ModifyWebhookEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(WebhookRouter.ROUTES.webhook(webhookId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  modifyWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    options: Omit<z.input<typeof ModifyWebhookEntity>, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = ModifyWebhookEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      WebhookRouter.ROUTES.webhookWithToken(webhookId, token),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhook(webhookId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(WebhookRouter.ROUTES.webhook(webhookId), {
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
    return this.#rest.delete(
      WebhookRouter.ROUTES.webhookWithToken(webhookId, token),
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
    options: z.input<typeof ExecuteWebhookEntity>,
    query: z.input<typeof ExecuteWebhookQueryEntity> = {},
  ): Promise<WebhookEntity | undefined> {
    const result = ExecuteWebhookEntity.safeParse(options);
    const resultQuery = ExecuteWebhookQueryEntity.safeParse(query);
    if (!(result.success && resultQuery.success)) {
      const errors = [
        ...(result.success ? [] : result.error.errors),
        ...(resultQuery.success ? [] : resultQuery.error.errors),
      ];

      throw new Error(
        errors.map((e) => `[${e.path.join(".")}] ${e.message}`).join(", "),
      );
    }

    const { files, ...rest } = result.data;
    return this.#rest.post(
      WebhookRouter.ROUTES.webhookWithToken(webhookId, token),
      {
        body: JSON.stringify(rest),
        query: resultQuery.data,
        files,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook}
   */
  executeSlackCompatibleWebhook(
    webhookId: Snowflake,
    token: string,
    query: z.input<typeof ExecuteWebhookQueryEntity> = {},
  ): Promise<void> {
    const result = ExecuteWebhookQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      WebhookRouter.ROUTES.webhookWithTokenSlack(webhookId, token),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook-query-string-params}
   */
  executeGithubCompatibleWebhook(
    webhookId: Snowflake,
    token: string,
    query: z.input<typeof ExecuteWebhookQueryEntity> = {},
  ): Promise<void> {
    const result = ExecuteWebhookQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      WebhookRouter.ROUTES.webhookWithTokenGithub(webhookId, token),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   */
  getWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    query: z.input<typeof GetWebhookMessageQueryEntity> = {},
  ): Promise<WebhookEntity> {
    const result = GetWebhookMessageQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      WebhookRouter.ROUTES.webhookMessage(webhookId, token, messageId),
      {
        query: result.data,
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
    options: z.input<typeof EditWebhookMessageEntity>,
    query: z.input<typeof GetWebhookMessageQueryEntity> = {},
  ): Promise<WebhookEntity> {
    const result = EditWebhookMessageEntity.safeParse(query);
    const resultQuery = GetWebhookMessageQueryEntity.safeParse(query);
    if (!(result.success && resultQuery.success)) {
      const errors = [
        ...(result.success ? [] : result.error.errors),
        ...(resultQuery.success ? [] : resultQuery.error.errors),
      ];

      throw new Error(
        errors.map((e) => `[${e.path.join(".")}] ${e.message}`).join(", "),
      );
    }

    const { files, ...rest } = options;
    return this.#rest.patch(
      WebhookRouter.ROUTES.webhookMessage(webhookId, token, messageId),
      {
        body: JSON.stringify(rest),
        query: resultQuery.data,
        files,
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
    query: z.input<typeof GetWebhookMessageQueryEntity> = {},
  ): Promise<void> {
    const result = GetWebhookMessageQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.delete(
      WebhookRouter.ROUTES.webhookMessage(webhookId, token, messageId),
      {
        query: result.data,
      },
    );
  }
}
