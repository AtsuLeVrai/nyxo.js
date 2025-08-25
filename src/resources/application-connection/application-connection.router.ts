import type { Rest } from "../../core/index.js";
import type { ApplicationRoleConnectionMetadataEntity } from "./application-connection.entity.js";

export class ApplicationConnectionRouter {
  static readonly Routes = {
    roleConnectionsMetadataEndpoint: (applicationId: string) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchRoleConnectionMetadata(
    applicationId: string,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.get(
      ApplicationConnectionRouter.Routes.roleConnectionsMetadataEndpoint(applicationId),
    );
  }
  updateRoleConnectionMetadata(
    applicationId: string,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.put(
      ApplicationConnectionRouter.Routes.roleConnectionsMetadataEndpoint(applicationId),
      { body: JSON.stringify(metadata) },
    );
  }
}
