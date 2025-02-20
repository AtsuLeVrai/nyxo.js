import {
  type ApplicationRoleConnectionEntity,
  TokenManager,
} from "@nyxjs/core";
import { Gateway } from "@nyxjs/gateway";
import {
  type GetCurrentUserGuildsQuerySchema,
  type ModifyCurrentUserSchema,
  Rest,
  type UpdateCurrentUserApplicationRoleConnectionSchema,
} from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { Connection, Guild, User } from "../class/index.js";
import { ClientEventManager } from "../managers/index.js";
import { ClientOptions } from "../options/index.js";
import type { ClientEventHandlers } from "../types/index.js";

export class Client extends EventEmitter<ClientEventHandlers> {
  readonly rest: Rest;
  readonly gateway: Gateway;

  readonly #options: ClientOptions;
  readonly #events: ClientEventManager;

  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#events = new ClientEventManager(this);
    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);
  }

  get token(): TokenManager {
    return new TokenManager(this.#options.token);
  }

  get options(): Readonly<ClientOptions> {
    return Object.freeze(this.#options);
  }

  connect(): Promise<void> {
    this.#events.initialize();
    return this.gateway.connect();
  }

  async destroy(): Promise<void> {
    await this.rest.destroy();
    this.gateway.destroy();
    this.removeAllListeners();
  }

  async getCurrentUser(): Promise<User> {
    const data = await this.rest.users.getCurrentUser();
    return new User(this, data);
  }

  async modifyCurrentUser(options: ModifyCurrentUserSchema): Promise<User> {
    const data = await this.rest.users.modifyCurrentUser(options);
    return new User(this, data);
  }

  async getCurrentGuilds(
    query?: GetCurrentUserGuildsQuerySchema,
  ): Promise<Guild[]> {
    const data = await this.rest.users.getCurrentUserGuilds(query);
    return data.map((guild) => new Guild(this, guild));
  }

  leaveGuild(guildId: string): Promise<void> {
    return this.rest.users.leaveGuild(guildId);
  }

  async getCurrentConnection(): Promise<Connection[]> {
    const data = await this.rest.users.getCurrentUserConnections();
    return data.map((connection) => new Connection(this, connection));
  }

  getCurrentApplicationRoleConnection(
    applicationId: string = this.token.id,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.users.getCurrentUserApplicationRoleConnection(
      applicationId,
    );
  }

  updateCurrentApplicationRoleConnection(
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
    applicationId: string = this.token.id,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.users.updateCurrentUserApplicationRoleConnection(
      applicationId,
      connection,
    );
  }
}
