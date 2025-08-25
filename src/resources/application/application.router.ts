import type { FileInput, Rest } from "../../core/index.js";
import type {
  ApplicationEntity,
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
} from "./application.entity.js";

export type ActivityLocationType = "gc" | "pc";

export interface ActivityLocationEntity {
  id: string;
  kind: ActivityLocationType;
  channel_id: string;
  guild_id?: string | null;
}

export interface ActivityInstanceEntity {
  application_id: string;
  instance_id: string;
  launch_id: string;
  location: ActivityLocationEntity;
  users: string[];
}

export interface ApplicationUpdateOptions {
  custom_install_url?: string;
  description?: string;
  role_connections_verification_url?: string;
  install_params?: InstallParamsEntity;
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;
  flags?: ApplicationFlags;
  icon?: FileInput;
  cover_image?: FileInput;
  interactions_endpoint_url?: string;
  tags?: string[];
  event_webhooks_url?: string;
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;
  event_webhooks_types?: string[];
}

export class ApplicationRouter {
  static readonly Routes = {
    currentApplicationEndpoint: () => "/applications/@me" as const,
    getActivityInstanceEndpoint: (applicationId: string, instanceId: string) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(ApplicationRouter.Routes.currentApplicationEndpoint());
  }
  async updateCurrentApplication(options: ApplicationUpdateOptions): Promise<ApplicationEntity> {
    const processedOptions = { ...options };
    if (processedOptions.icon) {
      processedOptions.icon = await this.#rest.toDataUri(processedOptions.icon);
    }
    if (processedOptions.cover_image) {
      processedOptions.cover_image = await this.#rest.toDataUri(processedOptions.cover_image);
    }
    return this.#rest.patch(ApplicationRouter.Routes.currentApplicationEndpoint(), {
      body: JSON.stringify(processedOptions),
    });
  }
  fetchActivityInstance(
    applicationId: string,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.#rest.get(
      ApplicationRouter.Routes.getActivityInstanceEndpoint(applicationId, instanceId),
    );
  }
}
