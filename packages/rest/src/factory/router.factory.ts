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

type RouterConstructor = new (rest: Rest) => unknown;
type RouterInstance = InstanceType<RouterConstructor>;
type RouterMap = Store<string, RouterInstance>;

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
  readonly #rest: Rest;
  readonly #routerMap: RouterMap = new Store();

  constructor(rest: Rest) {
    this.#rest = rest;

    for (const [routerName, routerClass] of Object.entries(ROUTER_MAPPING)) {
      const router = new routerClass(this.#rest);
      this.#routerMap.set(routerName, router);
    }
  }

  get size(): number {
    return this.#routerMap.size;
  }

  getRouter<K extends RouterNames>(
    routerInput: K,
  ): InstanceType<RouterClasses[K]> {
    if (!this.#isValidRouterName(routerInput)) {
      throw new Error(`Invalid router name: ${routerInput}`);
    }

    const router = this.#routerMap.get(routerInput);
    if (!router) {
      throw new Error(`Router instance not found: ${routerInput}`);
    }

    return router as InstanceType<(typeof ROUTER_MAPPING)[typeof routerInput]>;
  }

  hasRouter(routerName: string): routerName is keyof RouterInstances {
    return this.#routerMap.has(routerName);
  }

  clear(): void {
    this.#routerMap.clear();
  }

  #isValidRouterName(name: string): name is RouterNames {
    return name in ROUTER_MAPPING;
  }
}
