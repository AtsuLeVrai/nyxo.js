import type {
    ChannelStructure,
    ConnectionStructure,
    GuildMemberStructure,
    GuildStructure,
    Snowflake,
    UserStructure,
} from "@nyxjs/core";
import {
    type CreateGroupDmJsonParams,
    type ModifyCurrentUserJsonParams,
    type UpdateCurrentUserApplicationRoleConnectionJsonParams,
    UserRoutes,
} from "@nyxjs/rest";
import type { Client } from "../Client.js";
import { ApplicationRoleConnection, Connection, Guild, GuildMember, User } from "../structures/index.js";

export class UserManager {
    #client: Client;
    #userCache: Map<string, UserStructure> = new Map();
    #guildMemberCache: Map<string, GuildMemberStructure> = new Map();
    #connectionCache: Map<string, ConnectionStructure[]> = new Map();
    #guildCache: Map<string, GuildStructure[]> = new Map();

    constructor(client: Client) {
        this.#client = client;
    }

    async createDm(userId: Snowflake): Promise<ChannelStructure> {
        return this.#client.rest.request(
            UserRoutes.createDm({
                recipient_id: userId,
            })
        );
    }

    async createGroupDm(data: CreateGroupDmJsonParams): Promise<ChannelStructure> {
        return this.#client.rest.request(UserRoutes.createDm(data));
    }

    async fetch(userId: Snowflake | "@me", force = false): Promise<User> {
        // 1. Si force = true, on skip complètement la vérification du cache
        if (!force) {
            // 2. On essaie de récupérer du cache
            const cachedUser = this.#userCache.get(userId);

            // 3. Si on a trouvé quelque chose
            if (cachedUser) {
                return new User(cachedUser);
            }
            // 4. Si cachedUser est undefined, on continue naturellement
        }

        // 5. On arrive ici si :
        //    - force = true
        //    - OU si aucune donnée n'a été trouvée dans le cache
        //    - OU si les données du cache étaient expirées
        const userData = await this.#client.rest.request(UserRoutes.getUser(userId));
        this.#userCache.set(userId, userData);
        return new User(userData);
    }

    async fetchCurrentApplicationRoleConnection(applicationId: Snowflake): Promise<ApplicationRoleConnection> {
        const applicationData = await this.#client.rest.request(
            UserRoutes.getCurrentUserApplicationRoleConnection(applicationId)
        );
        return new ApplicationRoleConnection(applicationData);
    }

    async fetchCurrentConnections(force = false): Promise<Connection[]> {
        if (!force) {
            const cachedConnections = this.#connectionCache.get("current");
            if (cachedConnections) {
                return cachedConnections.map((conn) => new Connection(conn));
            }
        }

        const connectionsData = await this.#client.rest.request(UserRoutes.getCurrentUserConnections());
        this.#connectionCache.set("current", connectionsData);
        return connectionsData.map((conn) => new Connection(conn));
    }

    async fetchCurrentGuildMember(guildId: Snowflake, force = false): Promise<GuildMember> {
        if (!force) {
            const cacheKey = `${guildId}`;
            const cachedMember = this.#guildMemberCache.get(cacheKey);
            if (cachedMember) {
                return new GuildMember(cachedMember);
            }
        }

        const memberData = await this.#client.rest.request(UserRoutes.getCurrentUserGuildMember(guildId));
        this.#guildMemberCache.set(guildId, memberData);
        return new GuildMember(memberData);
    }

    async fetchCurrentGuilds(force = false): Promise<Guild[]> {
        if (!force) {
            const cachedGuilds = this.#guildCache.get("current");
            if (cachedGuilds) {
                return cachedGuilds.map((guild) => new Guild(guild));
            }
        }

        const guildsData = await this.#client.rest.request(UserRoutes.getCurrentUserGuilds());
        this.#guildCache.set("current", guildsData as GuildStructure[]);
        return guildsData.map((guild) => new Guild(guild));
    }

    async modifyCurrentUser(data: ModifyCurrentUserJsonParams): Promise<User> {
        const userData = await this.#client.rest.request(UserRoutes.modifyCurrentUser(data));
        this.#userCache.set("@me", userData);
        return new User(userData);
    }

    async updateCurrentApplicationRoleConnection(
        applicationId: Snowflake,
        data: UpdateCurrentUserApplicationRoleConnectionJsonParams
    ): Promise<ApplicationRoleConnection> {
        const applicationData = await this.#client.rest.request(
            UserRoutes.updateCurrentUserApplicationRoleConnection(applicationId, data)
        );
        return new ApplicationRoleConnection(applicationData);
    }

    clearCache(): void {
        this.#userCache.clear();
        this.#guildMemberCache.clear();
        this.#connectionCache.clear();
        this.#guildCache.clear();
    }

    invalidateUser(userId: Snowflake): void {
        this.#userCache.delete(userId);
    }

    invalidateGuildMember(guildId: Snowflake): void {
        this.#guildMemberCache.delete(guildId);
    }

    invalidateConnections(): void {
        this.#connectionCache.clear();
    }

    invalidateGuilds(): void {
        this.#guildCache.clear();
    }
}
