import {
  type ApplicationRoleConnectionMetadataEntity,
  ApplicationRoleConnectionMetadataType,
  type Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "./base.js";

export interface ApplicationConnectionRoutes {
  readonly base: (
    applicationId: Snowflake,
  ) => `/applications/${Snowflake}/role-connections/metadata`;
}

export class ApplicationConnectionRouter extends BaseRouter {
  static readonly MAX_METADATA_RECORDS = 5;
  static readonly MIN_METADATA_KEY = 1;
  static readonly MAX_METADATA_KEY = 50;
  static readonly MIN_METADATA_NAME = 1;
  static readonly MAX_METADATA_NAME = 100;
  static readonly MIN_METADATA_DESCRIPTION = 1;
  static readonly MAX_METADATA_DESCRIPTION = 200;
  static readonly KEY_REGEX = /^[a-z0-9_]+$/;

  static readonly ROUTES: ApplicationConnectionRoutes = {
    base: (applicationId: Snowflake) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  getApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.get(ApplicationConnectionRouter.ROUTES.base(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    this.#validateMetadataRecords(metadata);
    return this.put(ApplicationConnectionRouter.ROUTES.base(applicationId), {
      body: JSON.stringify(metadata),
    });
  }

  #validateMetadataRecords(
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): void {
    if (metadata.length > ApplicationConnectionRouter.MAX_METADATA_RECORDS) {
      throw new Error(
        `Cannot have more than ${ApplicationConnectionRouter.MAX_METADATA_RECORDS} metadata records`,
      );
    }

    for (const record of metadata.values()) {
      if (!ApplicationConnectionRouter.KEY_REGEX.test(record.key)) {
        throw new Error(
          "Metadata key must only contain lowercase letters, numbers, or underscores",
        );
      }

      if (
        record.key.length < ApplicationConnectionRouter.MIN_METADATA_KEY ||
        record.key.length > ApplicationConnectionRouter.MAX_METADATA_KEY
      ) {
        throw new Error(
          `Metadata key must be between ${ApplicationConnectionRouter.MIN_METADATA_KEY} and ${ApplicationConnectionRouter.MAX_METADATA_KEY} characters`,
        );
      }

      if (
        record.name.length < ApplicationConnectionRouter.MIN_METADATA_NAME ||
        record.name.length > ApplicationConnectionRouter.MAX_METADATA_NAME
      ) {
        throw new Error(
          `Metadata name must be between ${ApplicationConnectionRouter.MIN_METADATA_NAME} and ${ApplicationConnectionRouter.MAX_METADATA_NAME} characters`,
        );
      }

      if (
        record.description.length <
          ApplicationConnectionRouter.MIN_METADATA_DESCRIPTION ||
        record.description.length >
          ApplicationConnectionRouter.MAX_METADATA_DESCRIPTION
      ) {
        throw new Error(
          `Metadata description must be between ${ApplicationConnectionRouter.MIN_METADATA_DESCRIPTION} and ${ApplicationConnectionRouter.MAX_METADATA_DESCRIPTION} characters`,
        );
      }

      if (
        !Object.values(ApplicationRoleConnectionMetadataType).includes(
          record.type,
        )
      ) {
        throw new Error(
          "Invalid metadata type. Must be a valid ApplicationRoleConnectionMetadataType",
        );
      }

      if (record.name_localizations) {
        for (const [locale, name] of Object.entries(
          record.name_localizations,
        )) {
          if (
            name.length < ApplicationConnectionRouter.MIN_METADATA_NAME ||
            name.length > ApplicationConnectionRouter.MAX_METADATA_NAME
          ) {
            throw new Error(
              `Localized name for ${locale} must be between ${ApplicationConnectionRouter.MIN_METADATA_NAME} and ${ApplicationConnectionRouter.MAX_METADATA_NAME} characters`,
            );
          }
        }
      }

      if (record.description_localizations) {
        for (const [locale, description] of Object.entries(
          record.description_localizations,
        )) {
          if (
            description.length <
              ApplicationConnectionRouter.MIN_METADATA_DESCRIPTION ||
            description.length >
              ApplicationConnectionRouter.MAX_METADATA_DESCRIPTION
          ) {
            throw new Error(
              `Localized description for ${locale} must be between ${ApplicationConnectionRouter.MIN_METADATA_DESCRIPTION} and ${ApplicationConnectionRouter.MAX_METADATA_DESCRIPTION} characters`,
            );
          }
        }
      }
    }
  }
}
