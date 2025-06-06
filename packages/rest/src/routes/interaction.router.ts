import type {
  InteractionCallbackResponseEntity,
  InteractionResponseEntity,
  MessageEntity,
  Snowflake,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type {
  WebhookExecuteOptions,
  WebhookMessageEditOptions,
} from "./webhook.router.js";

/**
 * Router for Discord Interaction-related endpoints.
 * Handles responses to slash commands, buttons, select menus, and other interactions.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding}
 */
export class InteractionRouter {
  /**
   * API route constants for interaction-related endpoints.
   */
  static readonly INTERACTION_ROUTES = {
    /**
     * Route for creating an initial response to an interaction.
     * @param interactionId - The ID of the interaction
     * @param interactionToken - The token for the interaction
     */
    createResponseEndpoint: (
      interactionId: Snowflake,
      interactionToken: string,
    ) => `/interactions/${interactionId}/${interactionToken}/callback` as const,

    /**
     * Route for retrieving the original response to an interaction.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     */
    getOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for editing the original response to an interaction.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     */
    editOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for deleting the original response to an interaction.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     */
    deleteOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for creating a followup message to an interaction.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     */
    createFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) => `/webhooks/${applicationId}/${interactionToken}` as const,

    /**
     * Route for retrieving a followup message.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     */
    getFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for editing a followup message.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     */
    editFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for deleting a followup message.
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     */
    deleteFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates an initial response to an interaction.
   * Must be sent within 3 seconds of receiving the interaction.
   *
   * @param interactionId - The ID of the interaction
   * @param interactionToken - The token for the interaction
   * @param options - The response options (type and data)
   * @param withResponse - Whether to return the interaction callback response
   * @returns The interaction callback response (if withResponse is true)
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  createResponse(
    interactionId: Snowflake,
    interactionToken: string,
    options: InteractionResponseEntity,
    withResponse = true,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.#rest.post(
      InteractionRouter.INTERACTION_ROUTES.createResponseEndpoint(
        interactionId,
        interactionToken,
      ),
      { body: JSON.stringify(options), query: { with_response: withResponse } },
    );
  }

  /**
   * Fetches the original response to an interaction.
   * Retrieves the message that was sent as the initial response.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns A promise resolving to the original message response
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
   */
  fetchOriginalResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.INTERACTION_ROUTES.getOriginalResponseEndpoint(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * Updates the original response to an interaction.
   * Modifies the message sent as the initial response.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The new message content/components/embeds
   * @returns A promise resolving to the updated message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  updateOriginalResponse(
    applicationId: Snowflake,
    interactionToken: string,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      InteractionRouter.INTERACTION_ROUTES.editOriginalResponseEndpoint(
        applicationId,
        interactionToken,
      ),
      { body: JSON.stringify(rest), files },
    );
  }

  /**
   * Deletes the original response to an interaction.
   * Removes the message sent as the initial response.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns A promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
   */
  deleteOriginalResponse(
    applicationId: Snowflake,
    interactionToken: string,
  ): Promise<void> {
    return this.#rest.delete(
      InteractionRouter.INTERACTION_ROUTES.deleteOriginalResponseEndpoint(
        applicationId,
        interactionToken,
      ),
    );
  }

  /**
   * Creates a followup message for an interaction.
   * Sends an additional message after the initial response.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The message content/components/embeds for the followup
   * @returns A promise resolving to the created message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   */
  createFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    options: WebhookExecuteOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.post(
      InteractionRouter.INTERACTION_ROUTES.createFollowupMessageEndpoint(
        applicationId,
        interactionToken,
      ),
      { body: JSON.stringify(rest), files },
    );
  }

  /**
   * Fetches a followup message for an interaction.
   * Retrieves a specific followup message by ID.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @returns A promise resolving to the followup message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
   */
  fetchFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.INTERACTION_ROUTES.getFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }

  /**
   * Updates a followup message for an interaction.
   * Modifies a specific followup message by ID.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @param options - The new message content/components/embeds
   * @returns A promise resolving to the updated message
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  updateFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      InteractionRouter.INTERACTION_ROUTES.editFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
      { body: JSON.stringify(rest), files },
    );
  }

  /**
   * Deletes a followup message for an interaction.
   * Removes a specific followup message by ID.
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
      InteractionRouter.INTERACTION_ROUTES.deleteFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
