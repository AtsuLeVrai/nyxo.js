import type {
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

export interface RouterDefinitions {
  applications: ApplicationRouter;
  commands: ApplicationCommandRouter;
  connections: ApplicationConnectionRouter;
  auditLogs: AuditLogRouter;
  autoModeration: AutoModerationRouter;
  channels: ChannelRouter;
  emojis: EmojiRouter;
  entitlements: EntitlementRouter;
  gateway: GatewayRouter;
  guilds: GuildRouter;
  templates: GuildTemplateRouter;
  interactions: InteractionRouter;
  invites: InviteRouter;
  messages: MessageRouter;
  oauth2: OAuth2Router;
  polls: PollRouter;
  scheduledEvents: ScheduledEventRouter;
  skus: SkuRouter;
  soundboards: SoundboardRouter;
  stages: StageInstanceRouter;
  stickers: StickerRouter;
  subscriptions: SubscriptionRouter;
  users: UserRouter;
  voice: VoiceRouter;
  webhooks: WebhookRouter;
}

export type RouterKey = keyof RouterDefinitions;
