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

type RouterConstructor = new (rest: Rest) => BaseRouter;

export class RouterManager {
  static readonly CACHE_CONFIG = {
    MAX_SIZE: 50,
    INIT_TIMEOUT: 5000,
  } as const;

  readonly #rest: Rest;
  readonly #routers = new Store<RouterKey, BaseRouter>();
  readonly #routerDefinitions: Record<string, RouterConstructor>;

  constructor(rest: Rest) {
    this.#rest = rest;
    this.#routerDefinitions = this.#initializeRouterDefinitions();
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    if (!this.#routers.has(key)) {
      const RouterClass = this.#getRouterClass(key);
      this.#createRouter(key, RouterClass);
    }

    return this.#routers.get(key) as RouterDefinitions[K];
  }

  hasRouter(key: RouterKey): boolean {
    return key in this.#routerDefinitions;
  }

  getAvailableRouters(): RouterKey[] {
    return Object.keys(this.#routerDefinitions) as RouterKey[];
  }

  getCachedRouters(): RouterKey[] {
    return Array.from(this.#routers.keys()) as RouterKey[];
  }

  isCached(key: RouterKey): boolean {
    return this.#routers.has(key);
  }

  clearRouters(): void {
    this.#destroyAllRouters();
    this.#routers.clear();
  }

  removeCachedRouter(key: RouterKey): boolean {
    const router = this.#routers.get(key);
    if (!router) {
      return false;
    }

    this.#destroyRouter(router);
    this.#routers.delete(key);
    return true;
  }

  async destroy(): Promise<void> {
    try {
      await Promise.race([
        this.#destroyAllRoutersWithTimeout(),
        this.#createTimeoutPromise(),
      ]);
    } finally {
      this.#routers.clear();
    }
  }

  #getRouterClass(key: RouterKey): RouterConstructor {
    const RouterClass = this.#routerDefinitions[key];
    if (!RouterClass) {
      throw new Error(`Router not found for key: ${key}`);
    }
    return RouterClass;
  }

  #createRouter(key: RouterKey, RouterClass: RouterConstructor): void {
    this.#ensureCacheLimit();
    const router = new RouterClass(this.#rest);
    this.#routers.set(key, router);
  }

  #ensureCacheLimit(): void {
    if (this.#routers.size >= RouterManager.CACHE_CONFIG.MAX_SIZE) {
      const [oldestKey] = this.#routers.keys();
      if (oldestKey) {
        this.removeCachedRouter(oldestKey);
      }
    }
  }

  #destroyRouter(router: BaseRouter): void {
    if ("destroy" in router && typeof router.destroy === "function") {
      router.destroy();
    }
  }

  async #destroyAllRoutersWithTimeout(): Promise<void> {
    const destroyPromises = Array.from(this.#routers.values()).map((router) => {
      if ("destroy" in router && typeof router.destroy === "function") {
        return Promise.resolve(router.destroy());
      }
      return Promise.resolve();
    });

    await Promise.all(destroyPromises);
  }

  #createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Router destroy timeout")),
        RouterManager.CACHE_CONFIG.INIT_TIMEOUT,
      ),
    );
  }

  #destroyAllRouters(): void {
    for (const router of this.#routers.values()) {
      this.#destroyRouter(router);
    }
  }

  #initializeRouterDefinitions(): Record<string, RouterConstructor> {
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
  }
}
