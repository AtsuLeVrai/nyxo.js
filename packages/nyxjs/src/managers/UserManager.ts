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

type CacheKey = `user:${string}` | `member:${string}` | `connections:${string}` | `guilds:${string}`;
type CacheValue = UserStructure | GuildMemberStructure | ConnectionStructure[] | GuildStructure[];

export class UserManager {
    #client: Client;
    #cache: Map<CacheKey, { value: CacheValue; timestamp: number }> = new Map();

    constructor(client: Client) {
        this.#client = client;
    }

    get cache(): Map<CacheKey, { value: CacheValue; timestamp: number }> {
        return this.#cache;
    }

    async createDm(userId: Snowflake): Promise<ChannelStructure> {
        return this.#client.rest.request(
            UserRoutes.createDm({
                recipient_id: userId,
            }),
        );
    }

    async createGroupDm(data: CreateGroupDmJsonParams): Promise<ChannelStructure> {
        return this.#client.rest.request(UserRoutes.createDm(data));
    }

    async fetch(userId: Snowflake | "@me", force = false): Promise<User> {
        const cacheKey = this.#getCacheKey("user", userId);

        if (!force) {
            const cachedUser = this.#getCache<UserStructure>(cacheKey);
            if (cachedUser) {
                return new User(cachedUser);
            }
        }

        const userData = await this.#client.rest.request(UserRoutes.getUser(userId));
        this.#setCache(cacheKey, userData);
        return new User(userData);
    }

    async fetchCurrentApplicationRoleConnection(applicationId: Snowflake): Promise<ApplicationRoleConnection> {
        const applicationData = await this.#client.rest.request(
            UserRoutes.getCurrentUserApplicationRoleConnection(applicationId),
        );
        return new ApplicationRoleConnection(applicationData);
    }

    async fetchCurrentConnections(force = false): Promise<Connection[]> {
        const cacheKey = this.#getCacheKey("connections");

        if (!force) {
            const cachedConnections = this.#getCache<ConnectionStructure[]>(cacheKey);
            if (cachedConnections) {
                return cachedConnections.map((conn) => new Connection(conn));
            }
        }

        const connectionsData = await this.#client.rest.request(UserRoutes.getCurrentUserConnections());
        this.#setCache(cacheKey, connectionsData);
        return connectionsData.map((conn) => new Connection(conn));
    }

    async fetchCurrentGuildMember(guildId: Snowflake, force = false): Promise<GuildMember> {
        const cacheKey = this.#getCacheKey("member", guildId);

        if (!force) {
            const cachedMember = this.#getCache<GuildMemberStructure>(cacheKey);
            if (cachedMember) {
                return new GuildMember(cachedMember);
            }
        }

        const memberData = await this.#client.rest.request(UserRoutes.getCurrentUserGuildMember(guildId));
        this.#setCache(cacheKey, memberData);
        return new GuildMember(memberData);
    }

    async fetchCurrentGuilds(force = false): Promise<Guild[]> {
        const cacheKey = this.#getCacheKey("guilds");

        if (!force) {
            const cachedGuilds = this.#getCache<GuildStructure[]>(cacheKey);
            if (cachedGuilds) {
                return cachedGuilds.map((guild) => new Guild(guild));
            }
        }

        const guildsData = await this.#client.rest.request(UserRoutes.getCurrentUserGuilds());
        this.#setCache(cacheKey, guildsData as GuildStructure[]);
        return guildsData.map((guild) => new Guild(guild));
    }

    async modifyCurrentUser(data: ModifyCurrentUserJsonParams): Promise<User> {
        const userData = await this.#client.rest.request(UserRoutes.modifyCurrentUser(data));
        this.#setCache(this.#getCacheKey("user"), userData);
        return new User(userData);
    }

    async updateCurrentApplicationRoleConnection(
        applicationId: Snowflake,
        data: UpdateCurrentUserApplicationRoleConnectionJsonParams,
    ): Promise<ApplicationRoleConnection> {
        const applicationData = await this.#client.rest.request(
            UserRoutes.updateCurrentUserApplicationRoleConnection(applicationId, data),
        );
        return new ApplicationRoleConnection(applicationData);
    }

    clearCache(): void {
        this.#cache.clear();
    }

    invalidateUser(userId: Snowflake): void {
        this.#cache.delete(this.#getCacheKey("user", userId));
    }

    invalidateGuildMember(guildId: Snowflake): void {
        this.#cache.delete(this.#getCacheKey("member", guildId));
    }

    invalidateConnections(): void {
        this.#cache.delete(this.#getCacheKey("connections"));
    }

    invalidateGuilds(): void {
        this.#cache.delete(this.#getCacheKey("guilds"));
    }

    #getCacheKey(type: "user" | "member" | "connections" | "guilds", id = this.#client.user.id): CacheKey {
        return `${type}:${id}`;
    }

    #setCache<T extends CacheValue>(key: CacheKey, value: T): void {
        this.#cache.set(key, {
            value,
            timestamp: Date.now(),
        });
    }

    #getCache<T extends CacheValue>(key: CacheKey): T | undefined {
        const cached = this.#cache.get(key);
        return cached?.value as T;
    }
}
