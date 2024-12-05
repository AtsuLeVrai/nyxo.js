import type {
  ApplicationCommandEntity,
  ApplicationCommandPermissionEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export interface EditCommandPermissionsOptionsEntity {
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export type CreateCommandOptionsEntity = Pick<
  ApplicationCommandEntity,
  | "name"
  | "name_localizations"
  | "description"
  | "description_localizations"
  | "options"
  | "default_member_permissions"
  | "dm_permission"
  | "default_permission"
  | "integration_types"
  | "contexts"
  | "type"
  | "nsfw"
>;
