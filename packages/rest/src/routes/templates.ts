import type { GuildStructure, GuildTemplateStructure, Snowflake } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params|Modify Guild Template JSON Params}
 */
export type ModifyGuildTemplateJsonParams = Pick<GuildTemplateStructure, "name" | "description">;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params|Create Guild Template JSON Params}
 */
export type CreateGuildTemplateJsonParams = Pick<GuildTemplateStructure, "name" | "description">;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params|Create Guild From Guild Template JSON Params}
 */
export interface CreateGuildFromGuildTemplateJsonParams extends Pick<GuildTemplateStructure, "name"> {
    /**
     * base64 128x128 image for the guild icon
     */
    icon?: string;
}

export const GuildTemplateRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template|Delete Guild Template}
     */
    deleteGuildTemplate(guildId: Snowflake, code: string): RouteStructure<GuildTemplateStructure> {
        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/templates/${code}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template|Modify Guild Template}
     */
    modifyGuildTemplate(
        guildId: Snowflake,
        code: string,
        params: ModifyGuildTemplateJsonParams,
    ): RouteStructure<GuildTemplateStructure> {
        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/templates/${code}`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template|Sync Guild Template}
     */
    syncGuildTemplate(guildId: Snowflake, code: string): RouteStructure<GuildTemplateStructure> {
        return {
            method: RestMethods.Put,
            path: `/guilds/${guildId}/templates/${code}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template|Create Guild Template}
     */
    createGuildTemplate(
        guildId: Snowflake,
        params: CreateGuildTemplateJsonParams,
    ): RouteStructure<GuildTemplateStructure> {
        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/templates`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link hhttps://discord.com/developers/docs/resources/guild-template#get-guild-templates|Get Guild Templates}
     */
    getGuildTemplates(guildId: Snowflake): RouteStructure<GuildTemplateStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/templates`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template|Create Guild From Guild Template}
     */
    createGuildFromGuildTemplate(
        code: string,
        params: CreateGuildFromGuildTemplateJsonParams,
    ): RouteStructure<GuildStructure> {
        return {
            method: RestMethods.Post,
            path: `/guilds/templates/${code}`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template|Get Guild Template}
     */
    getGuildTemplate(code: string): RouteStructure<GuildTemplateStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/templates/${code}`,
        };
    },
} as const;
