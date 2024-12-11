import type { Rest } from "../core/Rest.js";
import {
  ApplicationCommandRouter,
  ApplicationConnectionRouter,
  ApplicationRouter,
  AuditLogRouter,
  AutoModerationRouter,
  type BaseRouter,
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
  static readonly #ROUTER_CACHE_SIZE = 50;

  readonly #rest: Rest;
  readonly #routers = new Map<string, BaseRouter>();
  readonly #routerDefinitions: Record<string, BaseRouter>;
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
      const routerCreator = this.#routerDefinitions[key];
      if (!routerCreator) {
        const error = new Error(`Router not found for key: ${key}`);
        this.#rest.emit("error", error);
        throw error;
      }

      this.#addToCache(key, routerCreator);
      this.#rest.emit("debug", `Created new router instance for key: ${key}`);
    }

    return this.#routers.get(key) as RouterDefinitions[K];
  }

  clearRouters(): void {
    if (this.#isDestroyed) {
      throw new Error("RouterManager has been destroyed");
    }

    this.#rest.emit("debug", "Clearing all routers");
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

    if (!this.#routers.has(key)) {
      this.#rest.emit("debug", `Router ${key} not found in cache`);
      return false;
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

    for (const [key, router] of this.#routers.entries()) {
      try {
        if ("destroy" in router && typeof router.destroy === "function") {
          await router.destroy();
        }
        this.#rest.emit("debug", `Destroyed router: ${key}`);
      } catch (error) {
        this.#rest.emit(
          "error",
          new Error(
            `Failed to destroy router ${key}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }

    this.#routers.clear();
  }

  #addToCache(key: string, router: BaseRouter): void {
    if (this.#routers.size >= RouterManager.#ROUTER_CACHE_SIZE) {
      const [oldestKey] = this.#routers.keys();
      if (!oldestKey) {
        this.#rest.emit("warn", "Router cache is full but no router to remove");
        return;
      }

      this.#routers.delete(oldestKey);
      this.#rest.emit("debug", `Removed oldest router ${oldestKey} from cache`);
    }

    this.#routers.set(key, router);
  }

  #initializeRouterDefinitions(): Record<RouterKey, BaseRouter> {
    try {
      return {
        applications: new ApplicationRouter(this.#rest),
        commands: new ApplicationCommandRouter(this.#rest),
        connections: new ApplicationConnectionRouter(this.#rest),
        auditLogs: new AuditLogRouter(this.#rest),
        autoModeration: new AutoModerationRouter(this.#rest),
        channels: new ChannelRouter(this.#rest),
        emojis: new EmojiRouter(this.#rest),
        entitlements: new EntitlementRouter(this.#rest),
        gateway: new GatewayRouter(this.#rest),
        guilds: new GuildRouter(this.#rest),
        templates: new GuildTemplateRouter(this.#rest),
        interactions: new InteractionRouter(this.#rest),
        invites: new InviteRouter(this.#rest),
        messages: new MessageRouter(this.#rest),
        oauth2: new OAuth2Router(this.#rest),
        polls: new PollRouter(this.#rest),
        scheduledEvents: new ScheduledEventRouter(this.#rest),
        skus: new SkuRouter(this.#rest),
        soundboards: new SoundboardRouter(this.#rest),
        stages: new StageInstanceRouter(this.#rest),
        stickers: new StickerRouter(this.#rest),
        subscriptions: new SubscriptionRouter(this.#rest),
        users: new UserRouter(this.#rest),
        voice: new VoiceRouter(this.#rest),
        webhooks: new WebhookRouter(this.#rest),
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
