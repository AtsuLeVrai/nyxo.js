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
 *
 * This class provides methods to respond to and manage Discord interactions,
 * which are the foundation of slash commands, buttons, select menus, and
 * other interactive components in Discord.
 *
 * @remarks
 * Interactions in Discord are real-time events triggered when users interact
 * with application components like slash commands or buttons. Applications must
 * respond to these interactions promptly (within 3 seconds), and can then send
 * follow-up messages or edit the original response as needed.
 *
 * This router handles three main types of operations:
 * 1. Creating initial responses to interactions
 * 2. Managing the original interaction responses
 * 3. Creating and managing followup messages
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
     *
     * This endpoint is used to respond within the 3-second window after
     * receiving an interaction.
     *
     * @param interactionId - The ID of the interaction
     * @param interactionToken - The token for the interaction
     * @returns The formatted API route string
     */
    createResponseEndpoint: (
      interactionId: Snowflake,
      interactionToken: string,
    ) => `/interactions/${interactionId}/${interactionToken}/callback` as const,

    /**
     * Route for retrieving the original response to an interaction.
     *
     * This endpoint allows getting the original message that was sent as
     * a response to the interaction.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns The formatted API route string
     */
    getOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for editing the original response to an interaction.
     *
     * This endpoint allows updating the message that was sent as the
     * initial response to the interaction.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns The formatted API route string
     */
    editOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for deleting the original response to an interaction.
     *
     * This endpoint allows removing the message that was sent as the
     * initial response to the interaction.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns The formatted API route string
     */
    deleteOriginalResponseEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,

    /**
     * Route for creating a followup message to an interaction.
     *
     * This endpoint allows sending additional messages after the initial
     * response to the interaction.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @returns The formatted API route string
     */
    createFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
    ) => `/webhooks/${applicationId}/${interactionToken}` as const,

    /**
     * Route for retrieving a followup message for an interaction.
     *
     * This endpoint allows getting a specific followup message that was
     * sent after the initial response.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns The formatted API route string
     */
    getFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for editing a followup message for an interaction.
     *
     * This endpoint allows updating a specific followup message that was
     * sent after the initial response.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns The formatted API route string
     */
    editFollowupMessageEndpoint: (
      applicationId: Snowflake,
      interactionToken: string,
      messageId: Snowflake,
    ) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,

    /**
     * Route for deleting a followup message for an interaction.
     *
     * This endpoint allows removing a specific followup message that was
     * sent after the initial response.
     *
     * @param applicationId - The ID of the application
     * @param interactionToken - The token for the interaction
     * @param messageId - The ID of the followup message
     * @returns The formatted API route string
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
   * Creates a new Interaction Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates an initial response to an interaction.
   *
   * This method sends the first response to a Discord interaction, which must be
   * done within 3 seconds of receiving the interaction to acknowledge it.
   *
   * @param interactionId - The ID of the interaction
   * @param interactionToken - The token for the interaction
   * @param options - The response options (type and data)
   * @param withResponse - Whether to return the interaction callback response
   * @returns The interaction callback response (if withResponse is true), otherwise undefined
   * @throws {Error} Error if validation of options fails or the token is expired
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   *
   * @remarks
   * Interaction tokens are valid for 15 minutes, but you must respond
   * to the initial interaction within 3 seconds or the token will be invalidated.
   *
   * Common response types:
   * - 1: PONG (for PING interactions)
   * - 4: CHANNEL_MESSAGE_WITH_SOURCE (visible message)
   * - 5: DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE ("thinking" state, then message)
   * - 6: DEFERRED_UPDATE_MESSAGE ("thinking" state, then update original message)
   * - 7: UPDATE_MESSAGE (update the message that contains the component)
   * - 9: MODAL (show a modal popup)
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
      {
        body: JSON.stringify(options),
        query: { with_response: withResponse },
      },
    );
  }

  /**
   * Fetches the original response to an interaction.
   *
   * This method retrieves the message that was sent as the initial response
   * to an interaction.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns A promise resolving to the original message response to the interaction
   * @throws {Error} Will throw an error if the interaction token is invalid or expired
   *
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
   *
   * This method modifies the message that was sent as the initial response
   * to an interaction, allowing you to update content, embeds, components, etc.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The new message content/components/embeds
   * @returns A promise resolving to the updated message
   * @throws {Error} Error if validation of options fails or the token is expired
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  updateOriginalResponse(
    applicationId: Snowflake,
    interactionToken: string,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRouter.INTERACTION_ROUTES.editOriginalResponseEndpoint(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Deletes the original response to an interaction.
   *
   * This method removes the message that was sent as the initial response
   * to an interaction.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @returns A promise that resolves when the deletion is complete
   * @throws {Error} Will throw an error if the token is expired or invalid
   *
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
   *
   * This method sends an additional message after the initial response to an
   * interaction. Followup messages can be sent anytime within the 15-minute
   * token validity period.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param options - The message content/components/embeds/flags for the followup
   * @returns A promise resolving to the created message
   * @throws {Error} Error if validation of options fails or the token is expired
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   *
   * @remarks
   * User-installed apps that aren't installed in the server are limited
   * to 5 followup messages per interaction.
   *
   * Flags:
   * - 64: EPHEMERAL (only visible to the user who triggered the interaction)
   * - 1 << 12: SUPPRESS_NOTIFICATIONS (don't send notifications to users)
   */
  createFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    options: WebhookExecuteOptions,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      InteractionRouter.INTERACTION_ROUTES.createFollowupMessageEndpoint(
        applicationId,
        interactionToken,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches a followup message for an interaction.
   *
   * This method retrieves a specific followup message that was sent after
   * the initial response to an interaction.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @returns A promise resolving to the followup message
   * @throws {Error} Will throw an error if the message doesn't exist or the token is expired
   *
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
   *
   * This method modifies a specific followup message that was sent after
   * the initial response to an interaction.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @param options - The new message content/components/embeds
   * @returns A promise resolving to the updated message
   * @throws {Error} Error if validation of options fails or the token is expired
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  updateFollowupMessage(
    applicationId: Snowflake,
    interactionToken: string,
    messageId: Snowflake,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      InteractionRouter.INTERACTION_ROUTES.editFollowupMessageEndpoint(
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
   * Deletes a followup message for an interaction.
   *
   * This method removes a specific followup message that was sent after
   * the initial response to an interaction.
   *
   * @param applicationId - The ID of the application
   * @param interactionToken - The token for the interaction
   * @param messageId - The ID of the followup message
   * @returns A promise that resolves when the deletion is complete
   * @throws {Error} Will throw an error if the message doesn't exist or the token is expired
   *
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
