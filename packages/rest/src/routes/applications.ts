import type { DataUriSchema, Snowflake } from "@nyxjs/core";
import type {
	ApplicationFlags,
	ApplicationInstallParams,
	ApplicationIntegrationTypeConfiguration,
	ApplicationRoleConnectionMetadataStructure,
	ApplicationStructure,
	IntegrationTypes,
} from "../structures/applications";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
 */
function updateApplicationRoleConnectionMetadataRecords(applicationId: Snowflake, json: ApplicationRoleConnectionMetadataStructure): RestRequestOptions<ApplicationRoleConnectionMetadataStructure[]> {
	return {
		method: "PATCH",
		path: `/applications/${applicationId}/role-connections/metadata`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
 */
function getApplicationRoleConnectionMetadataRecords(applicationId: Snowflake): RestRequestOptions<ApplicationRoleConnectionMetadataStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/role-connections/metadata`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export type EditCurrentApplicationJSONParams = {
	/**
	 * Default rich presence invite cover image for the app
	 */
	cover_image?: DataUriSchema;
	/**
	 * Default custom authorization URL for the app, if enabled
	 */
	custom_install_url?: string;
	/**
	 * Description of the app
	 */
	description?: string;
	/**
	 * App's public flags
	 */
	flags?: ApplicationFlags;
	/**
	 * Icon for the app
	 */
	icon?: DataUriSchema;
	/**
	 * Settings for the app's default in-app authorization link, if enabled
	 */
	install_params?: ApplicationInstallParams;
	/**
	 * Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object
	 */
	integration_types_config?: Record<IntegrationTypes, ApplicationIntegrationTypeConfiguration>;
	/**
	 * Interactions endpoint URL for the app
	 */
	interactions_endpoint_url?: string;
	/**
	 * Role connection verification URL for the app
	 */
	role_connections_verification_url?: string;
	/**
	 * List of tags describing the content and functionality of the app (max of 20 characters per tag). Max of 5 tags.
	 */
	tags?: string[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
 */
function editCurrentApplication(json: EditCurrentApplicationJSONParams): RestRequestOptions<ApplicationStructure> {
	return {
		method: "PATCH",
		path: "/applications/@me",
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
 */
function getCurrentApplication(): RestRequestOptions<ApplicationStructure> {
	return {
		method: "GET",
		path: "/applications/@me",
	};
}

export const ApplicationsRoutes = {
	editCurrentApplication,
	getCurrentApplication,
	getApplicationRoleConnectionMetadataRecords,
	updateApplicationRoleConnectionMetadataRecords,
};
