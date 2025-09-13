import type { LocaleValues } from "../enum/index.js";

export enum ApplicationRoleConnectionMetadataType {
  IntegerLessThanOrEqual = 1,
  IntegerGreaterThanOrEqual = 2,
  IntegerEqual = 3,
  IntegerNotEqual = 4,
  DatetimeLessThanOrEqual = 5,
  DatetimeGreaterThanOrEqual = 6,
  BooleanEqual = 7,
  BooleanNotEqual = 8,
}

export interface ApplicationRoleConnectionMetadataEntity {
  type: ApplicationRoleConnectionMetadataType;
  key: string;
  name: string;
  name_localizations?: Partial<Record<LocaleValues, string>>;
  description: string;
  description_localizations?: Partial<Record<LocaleValues, string>>;
}

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
