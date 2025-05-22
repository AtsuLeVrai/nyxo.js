import {
  type ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionType,
  type GuildApplicationCommandPermissionEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { MAX_PERMISSIONS } from "../utils/index.js";

/**
 * Zod validator for application command permissions.
 * Defines who can use a command in a guild.
 */
export const CommandPermissionSchema = z.object({
  /**
   * ID of the role, user, or channel.
   * For special constants, can be guildId (everyone) or guildId-1 (all channels).
   */
  id: z.string(),

  /**
   * Type of entity this permission applies to.
   */
  type: z.enum(ApplicationCommandPermissionType),

  /**
   * Whether to allow (true) or disallow (false) the command for this entity.
   */
  permission: z.boolean(),
}) satisfies z.ZodType<
  ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionEntity
>;

/**
 * Zod validator for guild application command permissions.
 * Represents permission settings for a command in a specific guild.
 */
export const GuildCommandPermissionSchema = z
  .object({
    /**
     * ID of the command or the application ID.
     */
    id: z.string(),

    /**
     * ID of the application the command belongs to.
     */
    application_id: z.string(),

    /**
     * ID of the guild where these permissions apply.
     */
    guild_id: z.string(),

    /**
     * Permission overwrites for the command.
     */
    permissions: z.array(CommandPermissionSchema).max(MAX_PERMISSIONS),
  })
  .refine(
    (data) => {
      // At least one permission is required
      return data.permissions.length > 0;
    },
    {
      message: "At least one permission is required",
      path: ["permissions"],
    },
  ) satisfies z.ZodType<
  GuildApplicationCommandPermissionEntity,
  GuildApplicationCommandPermissionEntity
>;
