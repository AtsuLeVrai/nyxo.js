import type {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  InteractionCallbackEntity,
  MessageEntity,
  PollCreateRequestEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

/**
 * @todo Verify all the types in `InteractionResponseOptions`.
 */
export interface InteractionResponseOptionsEntity {
  type: number;
  data?: InteractionCallbackDataOptionsEntity;
}

/**
 * @todo Verify all the types in `InteractionCallbackDataOptions`.
 */
export interface InteractionCallbackDataOptionsEntity {
  tts?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  flags?: number;
  components?: ActionRowEntity[];
  attachments?: Partial<AttachmentEntity>[];
  poll?: PollCreateRequestEntity;
}

export class InteractionRouter extends BaseRouter {
  static routes = {
    createResponse: (
      interactionId: Snowflake,
      interactionToken: string,
    ): `/interactions/${Snowflake}/${string}/callback` => {
      return `/interactions/${interactionId}/${interactionToken}/callback` as const;
    },

    getOriginalResponse: (
      applicationId: Snowflake,
      interactionToken: string,
    ): `/webhooks/${Snowflake}/${string}/messages/@original` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const;
    },

    editOriginalResponse: (
      applicationId: Snowflake,
      interactionToken: string,
    ): `/webhooks/${Snowflake}/${string}/messages/@original` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const;
    },

    deleteOriginalResponse: (
      applicationId: Snowflake,
      interactionToken: string,
    ): `/webhooks/${Snowflake}/${string}/messages/@original` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const;
    },

    createFollowupMessage: (
      applicationId: Snowflake,
      interactionToken: string,
    ): `/webhooks/${Snowflake}/${string}` => {
      return `/webhooks/${applicationId}/${interactionToken}` as const;
    },

    getFollowupMessage: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ): `/webhooks/${Snowflake}/${string}/messages/${Snowflake}` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const;
    },

    editFollowupMessage: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ): `/webhooks/${Snowflake}/${string}/messages/${Snowflake}` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const;
    },

    deleteFollowupMessage: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ): `/webhooks/${Snowflake}/${string}/messages/${Snowflake}` => {
      return `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createInteractionResponse(
    interactionId: Snowflake,
    interactionToken: string,
    options: InteractionResponseOptionsEntity,
    withResponse = false,
  ): Promise<InteractionCallbackEntity | undefined> {
    return this.post(
      InteractionRouter.routes.createResponse(interactionId, interactionToken),
      {
        body: JSON.stringify(options),
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
    return this.get(
      InteractionRouter.routes.getOriginalResponse(
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
    options: Partial<InteractionCallbackDataOptionsEntity>,
  ): Promise<MessageEntity> {
    return this.patch(
      InteractionRouter.routes.editOriginalResponse(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
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
    return this.delete(
      InteractionRouter.routes.deleteOriginalResponse(
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
    options: InteractionCallbackDataOptionsEntity,
  ): Promise<MessageEntity> {
    return this.post(
      InteractionRouter.routes.createFollowupMessage(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
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
    return this.get(
      InteractionRouter.routes.getFollowupMessage(
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
    options: Partial<InteractionCallbackDataOptionsEntity>,
  ): Promise<MessageEntity> {
    return this.patch(
      InteractionRouter.routes.editFollowupMessage(
        applicationId,
        interactionToken,
        messageId,
      ),
      {
        body: JSON.stringify(options),
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
    return this.delete(
      InteractionRouter.routes.deleteFollowupMessage(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
