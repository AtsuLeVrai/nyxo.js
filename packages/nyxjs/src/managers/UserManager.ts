import type { ApplicationRoleConnectionStructure, Snowflake } from "@nyxjs/core";
import type { CreateDMJSONParams, CreateGroupDMJSONParams } from "@nyxjs/rest";
import { UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { Client } from "../client/Client";
import { DMChannel } from "../structures/Channels";
import { GuildMember } from "../structures/Guilds";
import { Connection, User } from "../structures/Users";

export class UserManager {
    public store: Store<string, any>;

    public constructor(private readonly client: Client) {
        this.store = new Store();
    }

    public static from(client: Client): UserManager {
        return new UserManager(client);
    }

    public async getUser(userId: Snowflake, forceRefresh?: boolean): Promise<User> {
        if (!forceRefresh) {
            const cachedUser = this.store.get(userId);
            if (cachedUser) return User.from(cachedUser);
        }

        const userData = await this.client.rest.request(UserRoutes.getUser(userId));
        this.store.set(userId, userData);
        return User.from(userData);
    }

    public async getCurrentMember(guildId: Snowflake, forceRefresh?: boolean): Promise<GuildMember> {
        if (!forceRefresh) {
            const cachedMember = this.store.get(guildId);
            if (cachedMember) return GuildMember.from(cachedMember);
        }

        const memberData = await this.client.rest.request(UserRoutes.getCurrentUserGuildMember(guildId));
        // this.store.set(this.client.user.id, memberData);
        return GuildMember.from(memberData);
    }

    public async exitGuild(guildId: Snowflake): Promise<void> {
        await this.client.rest.request(UserRoutes.leaveGuild(guildId));
    }

    public async openDM(userId: Snowflake): Promise<DMChannel> {
        const params: CreateDMJSONParams = { recipient_id: userId };
        const dmData = await this.client.rest.request(UserRoutes.createDM(params));
        return DMChannel.from(dmData);
    }

    public async openGroupDM(params: CreateGroupDMJSONParams): Promise<DMChannel> {
        const dmData = await this.client.rest.request(UserRoutes.createDM(params));
        return DMChannel.from(dmData);
    }

    public async getConnections(): Promise<Connection[]> {
        const connectionsData = await this.client.rest.request(UserRoutes.getCurrentUserConnections());
        return connectionsData.map((connection) => Connection.from(connection));
    }

    public async getAppRoleConnections(
        appId: Snowflake,
        forceRefresh = false
    ): Promise<ApplicationRoleConnectionStructure> {
        if (!forceRefresh) {
            const cachedConnections = this.store.get(appId);
            if (cachedConnections) return cachedConnections;
        }

        const connectionsData = await this.client.rest.request(
            UserRoutes.getCurrentUserApplicationRoleConnection(appId)
        );
        this.store.set(appId, connectionsData);
        return connectionsData;
    }
}
