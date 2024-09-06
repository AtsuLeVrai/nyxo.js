import type { ApplicationRoleConnectionMetadataStructure, ApplicationStructure } from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export type EditCurrentApplicationJSONParams = Pick<
    ApplicationStructure,
    | "cover_image"
    | "custom_install_url"
    | "description"
    | "flags"
    | "icon"
    | "install_params"
    | "integration_types_config"
    | "interactions_endpoint_url"
    | "role_connections_verification_url"
    | "tags"
>;

export const ApplicationsRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
     */
    updateApplicationRoleConnectionMetadataRecords: (
        applicationId: Snowflake,
        json: ApplicationRoleConnectionMetadataStructure
    ): RestRequestOptions<ApplicationRoleConnectionMetadataStructure[]> => ({
        method: "PATCH",
        path: `/applications/${applicationId}/role-connections/metadata`,
        body: JSON.stringify(json),
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
     */
    getApplicationRoleConnectionMetadataRecords: (
        applicationId: Snowflake
    ): RestRequestOptions<ApplicationRoleConnectionMetadataStructure[]> => ({
        method: "GET",
        path: `/applications/${applicationId}/role-connections/metadata`,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
     */
    editCurrentApplication: (json: EditCurrentApplicationJSONParams): RestRequestOptions<ApplicationStructure> => ({
        method: "PATCH",
        path: "/applications/@me",
        body: JSON.stringify(json),
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
     */
    getCurrentApplication: (): RestRequestOptions<ApplicationStructure> => ({
        method: "GET",
        path: "/applications/@me",
    }),
};
