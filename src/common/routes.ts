import type { HttpMethod } from "../core/index.js";
import {
  ApplicationRoutes,
  ChannelRoutes,
  EmojiRoutes,
  EntitlementRoutes,
  GatewayRoutes,
  GuildRoutes,
  GuildScheduledEventRoutes,
  GuildTemplateRoutes,
  InteractionRoutes,
  InviteRoutes,
  LobbyRoutes,
  MessageRoutes,
  PollRoutes,
  SKURoutes,
  SoundboardRoutes,
  StageInstanceRoutes,
  StickerRoutes,
  SubscriptionRoutes,
  UserRoutes,
  VoiceRoutes,
  WebhookRoutes,
} from "../resources/index.js";

export interface APIEndpointDefinition<
  Path extends string,
  Methods extends readonly HttpMethod[],
  Response,
  Reason extends boolean = false,
  Files extends boolean = false,
  RequestBody extends object | undefined = undefined,
  QueryParams extends Record<string, any> | undefined = undefined,
  Headers extends Record<string, string> | undefined = undefined,
> {
  readonly path: Path;
  readonly methods: Methods;
  readonly response: Response;
  readonly reason: Reason;
  readonly body: RequestBody;
  readonly files: Files;
  readonly query: QueryParams;
  readonly headers: Headers;
}

export type EndpointFactory<
  Path extends string,
  Methods extends readonly HttpMethod[],
  Response,
  Reason extends boolean = false,
  Files extends boolean = false,
  RequestBody extends object | undefined = undefined,
  QueryParams extends Record<string, any> | undefined = undefined,
  Headers extends Record<string, string> | undefined = undefined,
> = () => APIEndpointDefinition<
  Path,
  Methods,
  Response,
  Reason,
  Files,
  RequestBody,
  QueryParams,
  Headers
> &
  Path;

export const Routes = {
  application: ApplicationRoutes,
  channel: ChannelRoutes,
  emoji: EmojiRoutes,
  entitlement: EntitlementRoutes,
  gateway: GatewayRoutes,
  guild: GuildRoutes,
  guildScheduledEvent: GuildScheduledEventRoutes,
  guildTemplates: GuildTemplateRoutes,
  interaction: InteractionRoutes,
  invite: InviteRoutes,
  lobby: LobbyRoutes,
  message: MessageRoutes,
  poll: PollRoutes,
  sku: SKURoutes,
  soundboard: SoundboardRoutes,
  stageInstance: StageInstanceRoutes,
  sticker: StickerRoutes,
  subscription: SubscriptionRoutes,
  users: UserRoutes,
  voice: VoiceRoutes,
  webhook: WebhookRoutes,
} as const;
