import {
  type InteractionCallbackEntity,
  InteractionCallbackResponseEntity,
  type MessageEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  EditWebhookMessageSchema,
  ExecuteWebhookSchema,
} from "../schemas/index.js";

export class InteractionRouter extends BaseRouter {
  static readonly ROUTES = {
    interactionCreateResponse: (
      interactionId: Snowflake,
      interactionToken: string,
    ) => `/interactions/${interactionId}/${interactionToken}/callback` as const,
    webhookOriginalResponseGet: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    webhookOriginalResponseEdit: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    webhookOriginalResponseDelete: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    webhookFollowupMessageCreate: (
      applicationId: Snowflake,
      interactionToken: string,
    ) => `/webhooks/${applicationId}/${interactionToken}` as const,
    webhookFollowupMessageGet: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
    webhookFollowupMessageEdit: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
    webhookFollowupMessageDelete: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createInteractionResponse(
    interactionId: Snowflake,
    interactionToken: string,
    options: z.input<typeof InteractionCallbackResponseEntity>,
    withResponse = true,
  ): Promise<InteractionCallbackEntity | undefined> {
    const result = InteractionCallbackResponseEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      InteractionRouter.ROUTES.interactionCreateResponse(
        interactionId,
        interactionToken,
      ),
      {
        body: JSON.stringify(result.data),
        query: { with_response: withResponse },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
   */
  getOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<MessageEntity> {
    return this.rest.get(
      InteractionRouter.ROUTES.webhookOriginalResponseGet(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  editOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
    options: EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    const result = EditWebhookMessageSchema.partial().safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      InteractionRouter.ROUTES.webhookOriginalResponseEdit(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
   */
  deleteOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<void> {
    return this.rest.delete(
      InteractionRouter.ROUTES.webhookOriginalResponseDelete(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   */
  createFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    options: ExecuteWebhookSchema,
  ): Promise<MessageEntity> {
    const result = ExecuteWebhookSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      InteractionRouter.ROUTES.webhookFollowupMessageCreate(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
   */
  getFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.rest.get(
      InteractionRouter.ROUTES.webhookFollowupMessageGet(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  editFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
    options: EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    const result = EditWebhookMessageSchema.partial().safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      InteractionRouter.ROUTES.webhookFollowupMessageEdit(
        applicationId,
        interactionToken,
        messageId,
      ),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
   */
  deleteFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
  ): Promise<void> {
    return this.rest.delete(
      InteractionRouter.ROUTES.webhookFollowupMessageDelete(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
