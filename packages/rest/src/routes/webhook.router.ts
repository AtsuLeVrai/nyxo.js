import type { Snowflake, WebhookEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  CreateWebhookSchema,
  EditWebhookMessageSchema,
  ExecuteWebhookQuerySchema,
  ExecuteWebhookSchema,
  GetWebhookMessageQuerySchema,
  ModifyWebhookSchema,
} from "../schemas/index.js";

export class WebhookRouter extends BaseRouter {
  static readonly ROUTES = {
    channelWebhooks: (channelId: Snowflake) =>
      `/channels/${channelId}/webhooks` as const,
    guildWebhooks: (guildId: Snowflake) =>
      `/guilds/${guildId}/webhooks` as const,
    webhookBase: (webhookId: Snowflake) => `/webhooks/${webhookId}` as const,
    webhookWithToken: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,
    webhookWithTokenSlack: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,
    webhookWithTokenGithub: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,
    webhookTokenMessage: (
      webhookId: Snowflake,
      token: string,
      messageId: Snowflake,
    ) => `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  async createWebhook(
    channelId: Snowflake,
    options: CreateWebhookSchema,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = await CreateWebhookSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(WebhookRouter.ROUTES.channelWebhooks(channelId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  getChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.rest.get(WebhookRouter.ROUTES.channelWebhooks(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  getGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.rest.get(WebhookRouter.ROUTES.guildWebhooks(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  getWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.rest.get(WebhookRouter.ROUTES.webhookBase(webhookId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  getWebhookWithToken(
    webhookId: Snowflake,
    token: string,
  ): Promise<WebhookEntity> {
    return this.rest.get(
      WebhookRouter.ROUTES.webhookWithToken(webhookId, token),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   */
  async modifyWebhook(
    webhookId: Snowflake,
    options: ModifyWebhookSchema,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = await ModifyWebhookSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(WebhookRouter.ROUTES.webhookBase(webhookId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  async modifyWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    options: Omit<ModifyWebhookSchema, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    const result = await ModifyWebhookSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
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
    return this.rest.delete(WebhookRouter.ROUTES.webhookBase(webhookId), {
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
    return this.rest.delete(
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
    options: ExecuteWebhookSchema,
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<WebhookEntity | undefined> {
    const resultSchema = ExecuteWebhookSchema.safeParse(options);
    if (!resultSchema.success) {
      throw new Error(fromZodError(resultSchema.error).message);
    }

    const resultQuery = ExecuteWebhookQuerySchema.safeParse(query);
    if (!resultQuery.success) {
      throw new Error(fromZodError(resultQuery.error).message);
    }

    const { files, ...rest } = resultSchema.data;
    return this.rest.post(
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
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<void> {
    const result = ExecuteWebhookQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
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
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<void> {
    const result = ExecuteWebhookQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
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
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<WebhookEntity> {
    const result = GetWebhookMessageQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.get(
      WebhookRouter.ROUTES.webhookTokenMessage(webhookId, token, messageId),
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
    options: EditWebhookMessageSchema,
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<WebhookEntity> {
    const resultSchema = EditWebhookMessageSchema.safeParse(options);
    if (!resultSchema.success) {
      throw new Error(fromZodError(resultSchema.error).message);
    }

    const resultQuery = GetWebhookMessageQuerySchema.safeParse(query);
    if (!resultQuery.success) {
      throw new Error(fromZodError(resultQuery.error).message);
    }

    const { files, ...rest } = resultSchema.data;
    return this.rest.patch(
      WebhookRouter.ROUTES.webhookTokenMessage(webhookId, token, messageId),
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
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<void> {
    const result = GetWebhookMessageQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.delete(
      WebhookRouter.ROUTES.webhookTokenMessage(webhookId, token, messageId),
      {
        query: result.data,
      },
    );
  }
}
