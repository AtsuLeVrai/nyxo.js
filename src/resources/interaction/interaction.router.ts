import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { MessageEntity } from "../message/index.js";
import type {
  RESTWebhookExecuteJSONParams,
  RESTWebhookMessageEditJSONParams,
} from "../webhook/index.js";
import type {
  InteractionCallbackResponseEntity,
  InteractionResponseEntity,
} from "./interaction.entity.js";

export const InteractionRoutes = {
  createResponse: (interactionId: string, interactionToken: string) =>
    `/interactions/${interactionId}/${interactionToken}/callback` as const,
  getOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  editOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  deleteOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  createFollowupMessage: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}` as const,
  getFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  editFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  deleteFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
} as const satisfies RouteBuilder;

export class InteractionRouter extends BaseRouter {
  createResponse(
    interactionId: string,
    interactionToken: string,
    options: InteractionResponseEntity,
    withResponse = false,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.rest.post(InteractionRoutes.createResponse(interactionId, interactionToken), {
      body: JSON.stringify(options),
      query: { with_response: withResponse },
    });
  }

  getOriginalResponse(applicationId: string, interactionToken: string): Promise<MessageEntity> {
    return this.rest.get(InteractionRoutes.getOriginalResponse(applicationId, interactionToken));
  }

  editOriginalResponse(
    applicationId: string,
    interactionToken: string,
    options: RESTWebhookMessageEditJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.patch(
      InteractionRoutes.editOriginalResponse(applicationId, interactionToken),
      {
        body: JSON.stringify(body),
        files: files as FileInput[] | undefined,
      },
    );
  }

  deleteOriginalResponse(applicationId: string, interactionToken: string): Promise<void> {
    return this.rest.delete(
      InteractionRoutes.deleteOriginalResponse(applicationId, interactionToken),
    );
  }

  createFollowupMessage(
    applicationId: string,
    interactionToken: string,
    options: RESTWebhookExecuteJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.post(
      InteractionRoutes.createFollowupMessage(applicationId, interactionToken),
      {
        body: JSON.stringify(body),
        files,
      },
    );
  }

  getFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<MessageEntity> {
    return this.rest.get(
      InteractionRoutes.getFollowupMessage(applicationId, interactionToken, messageId),
    );
  }

  editFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
    options: RESTWebhookMessageEditJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.patch(
      InteractionRoutes.editFollowupMessage(applicationId, interactionToken, messageId),
      {
        body: JSON.stringify(body),
        files: files as FileInput[] | undefined,
      },
    );
  }

  deleteFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<void> {
    return this.rest.delete(
      InteractionRoutes.deleteFollowupMessage(applicationId, interactionToken, messageId),
    );
  }
}
