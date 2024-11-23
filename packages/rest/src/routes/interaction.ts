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
import type { Rest } from "../core/index.js";

interface InteractionResponseOptions {
  type: number;
  data?: InteractionCallbackDataOptions;
}

interface InteractionCallbackDataOptions {
  tts?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  flags?: number;
  components?: ActionRowEntity[];
  attachments?: Partial<AttachmentEntity>[];
  poll?: PollCreateRequestEntity;
}

export class InteractionRoutes {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createInteractionResponse(
    interactionId: Snowflake,
    interactionToken: string,
    options: InteractionResponseOptions,
    withResponse = false,
  ): Promise<InteractionCallbackEntity | undefined> {
    return this.#rest.post(
      InteractionRoutes.routes.createResponse(interactionId, interactionToken),
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
    return this.#rest.get(
      InteractionRoutes.routes.getOriginalResponse(
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
    options: Partial<InteractionCallbackDataOptions>,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRoutes.routes.editOriginalResponse(
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
    return this.#rest.delete(
      InteractionRoutes.routes.deleteOriginalResponse(
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
    options: InteractionCallbackDataOptions,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      InteractionRoutes.routes.createFollowupMessage(
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
    return this.#rest.get(
      InteractionRoutes.routes.getFollowupMessage(
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
    options: Partial<InteractionCallbackDataOptions>,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRoutes.routes.editFollowupMessage(
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
    return this.#rest.delete(
      InteractionRoutes.routes.deleteFollowupMessage(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
