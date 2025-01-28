import { Store } from "@nyxjs/store";
import type { Rest } from "../core/index.js";
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

interface RouterConstructor {
  new (rest: Rest): unknown;
}

type RouterInstance = InstanceType<RouterConstructor>;

const ROUTER_MAPPING = {
  applications: ApplicationRouter,
  commands: ApplicationCommandRouter,
  connections: ApplicationConnectionRouter,
  guilds: GuildRouter,
  channels: ChannelRouter,
  invites: InviteRouter,
  templates: GuildTemplateRouter,
  users: UserRouter,
  auditLogs: AuditLogRouter,
  messages: MessageRouter,
  interactions: InteractionRouter,
  emojis: EmojiRouter,
  stickers: StickerRouter,
  voice: VoiceRouter,
  soundboards: SoundboardRouter,
  stages: StageInstanceRouter,
  scheduledEvents: ScheduledEventRouter,
  polls: PollRouter,
  autoModeration: AutoModerationRouter,
  webhooks: WebhookRouter,
  oauth2: OAuth2Router,
  gateway: GatewayRouter,
  skus: SkuRouter,
  entitlements: EntitlementRouter,
  subscriptions: SubscriptionRouter,
} as const;

type RouterInstances = {
  [K in keyof typeof ROUTER_MAPPING]: InstanceType<(typeof ROUTER_MAPPING)[K]>;
};

type RouterClasses = typeof ROUTER_MAPPING;
type RouterNames = keyof RouterClasses;

export class RouterFactory {
  readonly #routerMap = new Store<string, RouterInstance>();
  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
    this.#initializeRouters();
  }

  get size(): number {
    return this.#routerMap.size;
  }

  getRouter<K extends RouterNames>(
    routerInput: K,
  ): InstanceType<RouterClasses[K]> {
    this.#validateRouterName(routerInput);

    const router = this.#routerMap.get(routerInput);
    if (!router) {
      throw new Error(`Router: ${routerInput} not found`);
    }

    return router as InstanceType<(typeof ROUTER_MAPPING)[typeof routerInput]>;
  }

  hasRouter(routerName: string): routerName is keyof RouterInstances {
    return this.#routerMap.has(routerName);
  }

  clear(): void {
    this.#routerMap.clear();
  }

  debug(): Map<string, RouterInstance> {
    return new Map(this.#routerMap);
  }

  destroy(): void {
    this.clear();
    this.#initializeRouters();
  }

  #initializeRouters(): void {
    for (const [routerName, RouterClass] of Object.entries(ROUTER_MAPPING)) {
      const router = new RouterClass(this.#rest);
      this.#routerMap.set(routerName, router);
    }
  }

  #validateRouterName(name: string): asserts name is RouterNames {
    if (!this.#isValidRouterName(name)) {
      throw new Error(`Invalid router name: ${name}`);
    }
  }

  #isValidRouterName(name: string): name is RouterNames {
    return name in ROUTER_MAPPING;
  }
}
