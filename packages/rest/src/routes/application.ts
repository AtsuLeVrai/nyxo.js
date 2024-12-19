import {
  type ApplicationEntity,
  ApplicationEventWebhookStatus,
  type Snowflake,
} from "@nyxjs/core";
import type {
  ActivityInstanceEntity,
  ModifyApplicationOptionsEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export interface ApplicationRoutes {
  readonly currentApplication: "/applications/@me";
  readonly activityInstance: (
    applicationId: Snowflake,
    instanceId: string,
  ) => `/applications/${Snowflake}/activity-instances/${string}`;
}

export class ApplicationRouter extends BaseRouter {
  static readonly MAX_TAGS = 5;
  static readonly MAX_TAG_LENGTH = 20;
  static readonly MAX_DESCRIPTION_LENGTH = 400;
  static readonly MAX_INSTALL_URL_LENGTH = 2000;
  static readonly MAX_ROLE_CONNECTIONS_URL_LENGTH = 2000;
  static readonly MAX_INTERACTIONS_URL_LENGTH = 2000;
  static readonly MAX_WEBHOOKS_LENGTH = 2000;
  static readonly MAX_EVENT_TYPES = 100;

  static ROUTES: ApplicationRoutes = {
    currentApplication: "/applications/@me" as const,

    activityInstance: (applicationId: Snowflake, instanceId: string) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.get(ApplicationRouter.ROUTES.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  editCurrentApplication(
    options: ModifyApplicationOptionsEntity,
  ): Promise<ApplicationEntity> {
    this.#validateModificationOptions(options);

    return this.patch(ApplicationRouter.ROUTES.currentApplication, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  getApplicationActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.get(
      ApplicationRouter.ROUTES.activityInstance(applicationId, instanceId),
    );
  }

  #validateModificationOptions(options: ModifyApplicationOptionsEntity): void {
    if (options.tags && options.tags.length > ApplicationRouter.MAX_TAGS) {
      throw new Error(`Maximum ${ApplicationRouter.MAX_TAGS} tags allowed`);
    }

    if (
      options.tags?.some((tag) => tag.length > ApplicationRouter.MAX_TAG_LENGTH)
    ) {
      throw new Error(
        `Tags must be ${ApplicationRouter.MAX_TAG_LENGTH} characters or less`,
      );
    }

    if (
      options.description &&
      options.description.length > ApplicationRouter.MAX_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `Description must be ${ApplicationRouter.MAX_DESCRIPTION_LENGTH} characters or less`,
      );
    }

    if (
      options.custom_install_url &&
      options.custom_install_url.length >
        ApplicationRouter.MAX_INSTALL_URL_LENGTH
    ) {
      throw new Error(
        `Custom install URL must be ${ApplicationRouter.MAX_INSTALL_URL_LENGTH} characters or less`,
      );
    }

    if (
      options.role_connections_verification_url &&
      options.role_connections_verification_url.length >
        ApplicationRouter.MAX_ROLE_CONNECTIONS_URL_LENGTH
    ) {
      throw new Error(
        `Role connections URL must be ${ApplicationRouter.MAX_ROLE_CONNECTIONS_URL_LENGTH} characters or less`,
      );
    }

    if (
      options.interactions_endpoint_url &&
      options.interactions_endpoint_url.length >
        ApplicationRouter.MAX_INTERACTIONS_URL_LENGTH
    ) {
      throw new Error(
        `Interactions endpoint URL must be ${ApplicationRouter.MAX_INTERACTIONS_URL_LENGTH} characters or less`,
      );
    }

    if (
      options.event_webhooks_url &&
      options.event_webhooks_url.length > ApplicationRouter.MAX_WEBHOOKS_LENGTH
    ) {
      throw new Error(
        `Event webhooks URL must be ${ApplicationRouter.MAX_WEBHOOKS_LENGTH} characters or less`,
      );
    }

    if (
      options.event_webhooks_types &&
      options.event_webhooks_types.length > ApplicationRouter.MAX_EVENT_TYPES
    ) {
      throw new Error(
        `Maximum ${ApplicationRouter.MAX_EVENT_TYPES} event types allowed`,
      );
    }

    if (
      options.event_webhooks_status &&
      !Object.values(ApplicationEventWebhookStatus).includes(
        options.event_webhooks_status,
      )
    ) {
      throw new Error(
        "Event webhooks status must be 1 (disabled), 2 (enabled), or 3 (disabled by discord)",
      );
    }
  }
}
