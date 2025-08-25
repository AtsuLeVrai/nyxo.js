import type { Rest } from "../../core/index.js";
import type { MessageEntity } from "../message/index.js";
import type { WebhookExecuteOptions, WebhookMessageEditOptions } from "../webhook/index.js";
import type {
  InteractionCallbackResponseEntity,
  InteractionResponseEntity,
} from "./interaction.entity.js";

export class InteractionRouter {
  static readonly Routes = {
    createResponseEndpoint: (interactionId: string, interactionToken: string) =>
      `/interactions/${interactionId}/${interactionToken}/callback` as const,
    getOriginalResponseEndpoint: (applicationId: string, interactionToken: string) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    editOriginalResponseEndpoint: (applicationId: string, interactionToken: string) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    deleteOriginalResponseEndpoint: (applicationId: string, interactionToken: string) =>
      `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
    createFollowupMessageEndpoint: (applicationId: string, interactionToken: string) =>
      `/webhooks/${applicationId}/${interactionToken}` as const,
    getFollowupMessageEndpoint: (
      applicationId: string,
      interactionToken: string,
      messageId: string,
    ) => `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
    editFollowupMessageEndpoint: (
      applicationId: string,
      interactionToken: string,
      messageId: string,
    ) => `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
    deleteFollowupMessageEndpoint: (
      applicationId: string,
      interactionToken: string,
      messageId: string,
    ) => `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  createResponse(
    interactionId: string,
    interactionToken: string,
    options: InteractionResponseEntity,
    withResponse = true,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.#rest.post(
      InteractionRouter.Routes.createResponseEndpoint(interactionId, interactionToken),
      { body: JSON.stringify(options), query: { with_response: withResponse } },
    );
  }
  fetchOriginalResponse(applicationId: string, interactionToken: string): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.Routes.getOriginalResponseEndpoint(applicationId, interactionToken),
    );
  }
  updateOriginalResponse(
    applicationId: string,
    interactionToken: string,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      InteractionRouter.Routes.editOriginalResponseEndpoint(applicationId, interactionToken),
      { body: JSON.stringify(rest), files },
    );
  }
  deleteOriginalResponse(applicationId: string, interactionToken: string): Promise<void> {
    return this.#rest.delete(
      InteractionRouter.Routes.deleteOriginalResponseEndpoint(applicationId, interactionToken),
    );
  }
  createFollowupMessage(
    applicationId: string,
    interactionToken: string,
    options: WebhookExecuteOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.post(
      InteractionRouter.Routes.createFollowupMessageEndpoint(applicationId, interactionToken),
      { body: JSON.stringify(rest), files },
    );
  }
  fetchFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      InteractionRouter.Routes.getFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
  updateFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
    options: WebhookMessageEditOptions,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      InteractionRouter.Routes.editFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
      { body: JSON.stringify(rest), files },
    );
  }
  deleteFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<void> {
    return this.#rest.delete(
      InteractionRouter.Routes.deleteFollowupMessageEndpoint(
        applicationId,
        interactionToken,
        messageId,
      ),
    );
  }
}
