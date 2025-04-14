import type {
  InteractionCallbackResponseEntity,
  InteractionResponseEntity,
  MessageEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type {
  EditWebhookMessageSchema,
  ExecuteWebhookSchema,
} from "./webhook.router.js";

/**
 * Router class for Discord Interaction-related endpoints
 * Provides methods to handle Discord interactions, including:
 * - Creating initial responses to interactions
 * - Managing original interaction responses
 * - Creating and managing followup messages
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding}
 */
export class InteractionRouter {
  /**
   * Collection of route URLs for interaction-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Route for creating an initial response to an interaction
     * @param interactionId - The ID of the interaction
     * @param interactionToken - The token for the interaction
     * @returns `/interactions/{interaction.id}/{interaction.token}/callback` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
     */
    interactionCreateResponse: (
      interactionId: Snowflake,
      interactionToken: string,
    ) => `/interactions/${interactionId}/${interactionToken}/callback` as const,

    /**
     * Route for retrieving the original response to an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/@original` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
     */
    webhookOriginalResponseGet: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for editing the original response to an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/@original` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
     */
    webhookOriginalResponseEdit: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for deleting the original response to an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/@original` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
     */
    webhookOriginalResponseDelete: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for creating a followup message to an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns `/webhooks/{application.id}/{interaction.token}` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
     */
    webhookFollowupMessageCreate: (
      applicationId: Snowflake,
      interactionToken: string,
    ) => `/webhooks/${applicationId}/${interactionToken}` as const,

    /**
     * Route for retrieving a followup message for an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/{message.id}` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
     */
    webhookFollowupMessageGet: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for editing a followup message for an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/{message.id}` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
     */
    webhookFollowupMessageEdit: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for deleting a followup message for an interaction
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns `/webhooks/{application.id}/{interaction.token}/messages/{message.id}` route
     * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
     */
    webhookFollowupMessageDelete: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a response to an interaction
   * Interaction tokens are valid for 15 minutes, but you must respond
   * to the initial interaction within 3 seconds or the token will be invalidated
   *
   * @param interactionId - The ID of the interaction
   * @param interactionToken - The token for the interaction
   * @param options - The response options (type and data)
   * @param withResponse - Whether to return the interaction callback response
   * @returns The interaction callback response (if withResponse is true), otherwise undefined
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createInteractionResponse(
    interactionId: Snowflake,
    interactionToken: string,
    options: InteractionResponseEntity,
    withResponse = true,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.#rest.post(
      InteractionRouter.ROUTES.interactionCreateResponse(
        interactionId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
        query: { with_response: withResponse },
      },
    );
  }

  /**
   * Retrieves the original response to an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns The original message response to the interaction
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
   */
  getOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.ROUTES.webhookOriginalResponseGet(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * Edits the original response to an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The new message content/components/embeds
   * @returns The updated message
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  editOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
    options: EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRouter.ROUTES.webhookOriginalResponseEdit(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Deletes the original response to an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns A promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
   */
  deleteOriginalInteractionResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<void> {
    return this.#rest.delete(
      InteractionRouter.ROUTES.webhookOriginalResponseDelete(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * Creates a followup message for an interaction
   * Apps are limited to 5 followup messages per interaction for user-installed apps
   * that aren't installed in the server
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The message content/components/embeds/flags for the followup
   * @returns The created message
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   */
  createFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    options: ExecuteWebhookSchema,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      InteractionRouter.ROUTES.webhookFollowupMessageCreate(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Retrieves a followup message for an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @returns The followup message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
   */
  getFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.ROUTES.webhookFollowupMessageGet(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }

  /**
   * Edits a followup message for an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @param options - The new message content/components/embeds
   * @returns The updated message
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  editFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
    options: EditWebhookMessageSchema,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRouter.ROUTES.webhookFollowupMessageEdit(
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
   * Deletes a followup message for an interaction
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @returns A promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
   */
  deleteFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      InteractionRouter.ROUTES.webhookFollowupMessageDelete(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
