import { Store } from "@nyxjs/store";
import type { BaseRouter } from "../base/index.js";
import type { Rest } from "../core/rest.js";
import {
  ApplicationCommandRouter,
  ApplicationConnectionRouter,
  ApplicationRouter,
  AuditLogRouter,
  AutoModerationRouter,
  ChannelRouter,
  EmojiRouter,
  EntitlementRouter,
  GatewayRouter,
  GuildRouter,
  GuildTemplateRouter,
  InteractionRouter,
  InviteRouter,
  MessageRouter,
  OAuth2Router,
  PollRouter,
  ScheduledEventRouter,
  SkuRouter,
  SoundboardRouter,
  StageInstanceRouter,
  StickerRouter,
  SubscriptionRouter,
  UserRouter,
  VoiceRouter,
  WebhookRouter,
} from "../routes/index.js";
import type { RouterDefinitions, RouterKey } from "../types/index.js";

export class RouterManager {
  static readonly ROUTER_CACHE_SIZE = 50;
  static readonly ROUTER_INIT_TIMEOUT = 5000;

  readonly #rest: Rest;
  readonly #routers = new Store<RouterKey, BaseRouter>();
  readonly #routerDefinitions: Record<string, new (rest: Rest) => BaseRouter>;
  #isDestroyed = false;

  constructor(rest: Rest) {
    this.#rest = rest;
    this.#routerDefinitions = this.#initializeRouterDefinitions();
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }

    this.#rest.emit("debug", `Getting router for key: ${key}`);

    if (!this.#routers.has(key)) {
      const RouterClass = this.#routerDefinitions[key];
      if (!RouterClass) {
        const error = new Error(`Router not found for key: ${key}`);
        this.#rest.emit("error", error);
        throw error;
      }

      try {
        this.#createRouter(key, RouterClass);
        this.#rest.emit("debug", `Created new router instance for key: ${key}`);
      } catch (error) {
        this.#rest.emit(
          "error",
          new Error(
            `Failed to create router ${key}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
        throw error;
      }
    }

    return this.#routers.get(key) as RouterDefinitions[K];
  }

  clearRouters(): void {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }

    this.#rest.emit("debug", "Clearing all routers");
    for (const router of this.#routers.values()) {
      if ("destroy" in router && typeof router.destroy === "function") {
        router.destroy();
      }
    }
    this.#routers.clear();
  }

  hasRouter(key: RouterKey): boolean {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }
    return key in this.#routerDefinitions;
  }

  getAvailableRouters(): RouterKey[] {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }
    return Object.keys(this.#routerDefinitions) as RouterKey[];
  }

  getCachedRouters(): RouterKey[] {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }
    return Array.from(this.#routers.keys()) as RouterKey[];
  }

  isCached(key: RouterKey): boolean {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }
    return this.#routers.has(key);
  }

  removeCachedRouter(key: RouterKey): boolean {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }

    const router = this.#routers.get(key);
    if (!router) {
      this.#rest.emit("debug", `Router ${key} not found in cache`);
      return false;
    }

    if ("destroy" in router && typeof router.destroy === "function") {
      router.destroy();
    }

    this.#routers.delete(key);
    this.#rest.emit("debug", `Removed router ${key} from cache`);
    return true;
  }

  async destroy(): Promise<void> {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#rest.emit("debug", "Destroying RouterManager");

    const destroyPromises: Promise<void>[] = [];

    for (const [key, router] of this.#routers.entries()) {
      try {
        if ("destroy" in router && typeof router.destroy === "function") {
          destroyPromises.push(
            Promise.resolve(router.destroy()).catch((error) => {
              this.#rest.emit(
                "error",
                new Error(
                  `Failed to destroy router ${key}: ${error instanceof Error ? error.message : String(error)}`,
                ),
              );
            }),
          );
        }
        this.#rest.emit("debug", `Destroyed router: ${key}`);
      } catch (error) {
        this.#rest.emit(
          "error",
          new Error(
            `Failed to initiate destroy for router ${key}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }

    try {
      await Promise.race([
        Promise.all(destroyPromises),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Router destroy timeout")),
            RouterManager.ROUTER_INIT_TIMEOUT,
          ),
        ),
      ]);
    } catch (error) {
      this.#rest.emit(
        "error",
        new Error(
          `Error during router cleanup: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }

    this.#routers.clear();
  }

  #createRouter(
    key: RouterKey,
    RouterClass: new (rest: Rest) => BaseRouter,
  ): void {
    if (this.#routers.size >= RouterManager.ROUTER_CACHE_SIZE) {
      const [oldestKey] = this.#routers.keys();
      if (!oldestKey) {
        this.#rest.emit("warn", "Router cache is full but no router to remove");
        return;
      }

      this.removeCachedRouter(oldestKey);
      this.#rest.emit("debug", `Removed oldest router ${oldestKey} from cache`);
    }

    const router = new RouterClass(this.#rest);
    this.#routers.set(key, router);
  }

  #initializeRouterDefinitions(): Record<
    string,
    new (
      rest: Rest,
    ) => BaseRouter
  > {
    try {
      return {
        applications: ApplicationRouter,
        commands: ApplicationCommandRouter,
        connections: ApplicationConnectionRouter,
        auditLogs: AuditLogRouter,
        autoModeration: AutoModerationRouter,
        channels: ChannelRouter,
        emojis: EmojiRouter,
        entitlements: EntitlementRouter,
        gateway: GatewayRouter,
        guilds: GuildRouter,
        templates: GuildTemplateRouter,
        interactions: InteractionRouter,
        invites: InviteRouter,
        messages: MessageRouter,
        oauth2: OAuth2Router,
        polls: PollRouter,
        scheduledEvents: ScheduledEventRouter,
        skus: SkuRouter,
        soundboards: SoundboardRouter,
        stages: StageInstanceRouter,
        stickers: StickerRouter,
        subscriptions: SubscriptionRouter,
        users: UserRouter,
        voice: VoiceRouter,
        webhooks: WebhookRouter,
      };
    } catch (error) {
      const initError = new Error(
        `Failed to initialize router definitions: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.#rest.emit("error", initError);
      throw initError;
    }
  }
}
