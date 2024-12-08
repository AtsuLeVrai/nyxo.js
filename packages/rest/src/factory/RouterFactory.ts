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

export class RouterFactory {
  readonly #rest: Rest;
  readonly #routers = new Map<string, BaseRouter>();
  readonly #routerDefinitions: Record<string, BaseRouter>;

  constructor(rest: Rest) {
    this.#rest = rest;
    this.#routerDefinitions = this.#initializeRouterDefinitions();
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    if (!this.#routers.has(key)) {
      const routerCreator = this.#routerDefinitions[key];
      if (!routerCreator) {
        throw new Error(`Router not found for key: ${key}`);
      }
      this.#routers.set(key, routerCreator);
    }

    return this.#routers.get(key) as RouterDefinitions[K];
  }

  clearRouters(): void {
    this.#routers.clear();
  }

  hasRouter(key: RouterKey): boolean {
    return key in this.#routerDefinitions;
  }

  getAvailableRouters(): RouterKey[] {
    return Object.keys(this.#routerDefinitions) as RouterKey[];
  }

  #initializeRouterDefinitions(): Record<RouterKey, BaseRouter> {
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
  }
}
