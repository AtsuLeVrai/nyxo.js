import type {
  ApplicationRoleConnectionObject,
  ConnectionObject,
  CreateApplicationEmojiJSONParams,
  CreateDMJSONParams,
  CreateGroupDMJSONParams,
  CreateGuildEmojiJSONParams,
  CreateGuildFromTemplateJSONParams,
  CreateGuildScheduledEventJSONParams,
  CreateGuildSoundboardSoundFormParams,
  CreateGuildStickerFormParams,
  CreateGuildTemplateJSONParams,
  CreateLobbyJSONParams,
  CreateStageInstanceJSONParams,
  CreateTestEntitlementJSONParams,
  DMChannelEntity,
  EmojiObject,
  EntitlementObject,
  GetAnswerVotersQueryStringParams,
  GetAnswerVotersResponse,
  GetCurrentUserGuildsQueryStringParams,
  GetGuildScheduledEventQueryStringParams,
  GetGuildScheduledEventUsersQueryStringParams,
  GuildEntity,
  GuildMemberEntity,
  GuildScheduledEventObject,
  GuildScheduledEventUserObject,
  GuildTemplateObject,
  HttpResponseCodes,
  LinkChannelLobbyJSONParams,
  ListApplicationEmojisResponse,
  ListEntitlementsQueryStringParams,
  ListScheduledEventsGuildQueryStringParams,
  ListSKUSubscriptionsQueryStringParams,
  ListStickerPacksResponse,
  LobbyMemberJSONParams,
  LobbyMemberObject,
  LobbyObject,
  MessageEntity,
  ModifyApplicationEmojiJSONParams,
  ModifyCurrentUserJSONParams,
  ModifyCurrentUserVoiceStateJSONParams,
  ModifyGuildEmojiJSONParams,
  ModifyGuildScheduledEventJSONParams,
  ModifyGuildSoundboardSoundJSONParams,
  ModifyGuildStickerJSONParams,
  ModifyGuildTemplateJSONParams,
  ModifyLobbyJSONParams,
  ModifyStageInstanceJSONParams,
  ModifyUserVoiceStateJSONParams,
  SendSoundboardSoundJSONParams,
  SKUObject,
  SoundboardSoundObject,
  StageInstanceObject,
  StickerObject,
  StickerPackObject,
  SubscriptionObject,
  UpdateCurrentUserApplicationRoleConnectionJSONParams,
  UserObject,
  VoiceRegionObject,
  VoiceStateObject,
} from "../resources/index.js";

export interface HttpOperationDefinition {
  readonly body?: object;
  readonly query?: object;
  readonly headers?: Record<string, string>;
  readonly response?: object;
  readonly responseHeaders?: Record<string, string>;
  readonly statusCodes?: HttpResponseCodes[];
}

export type HttpRouteSchema<
  TGet extends HttpOperationDefinition = HttpOperationDefinition,
  TPost extends HttpOperationDefinition = HttpOperationDefinition,
  TPut extends HttpOperationDefinition = HttpOperationDefinition,
  TPatch extends HttpOperationDefinition = HttpOperationDefinition,
  TDelete extends HttpOperationDefinition = HttpOperationDefinition,
> = {
  readonly GET?: TGet;
  readonly POST?: TPost;
  readonly PUT?: TPut;
  readonly PATCH?: TPatch;
  readonly DELETE?: TDelete;
};

export type TypedRoute<TSchema extends HttpRouteSchema = HttpRouteSchema> = string & {
  readonly __routeSchema: TSchema;
  readonly __brand: "TypedRoute";
};

export type ExtractRequestBody<T extends HttpOperationDefinition | undefined> =
  T extends HttpOperationDefinition ? (T extends { body: infer TBody } ? TBody : never) : never;

export type ExtractResponseBody<T extends HttpOperationDefinition | undefined> =
  T extends HttpOperationDefinition
    ? T extends { readonly response: infer TResponse }
      ? TResponse
      : never
    : never;

export type ExtractQueryParams<T extends HttpOperationDefinition | undefined> =
  T extends HttpOperationDefinition
    ? T extends { readonly query: infer TQuery }
      ? TQuery
      : never
    : never;

export type ExtractRequestHeaders<T extends HttpOperationDefinition | undefined> =
  T extends HttpOperationDefinition
    ? T extends { readonly headers: infer THeaders }
      ? THeaders
      : never
    : never;

export type ExtractResponseHeaders<T extends HttpOperationDefinition | undefined> =
  T extends HttpOperationDefinition
    ? T extends { readonly responseHeaders: infer THeaders }
      ? THeaders
      : never
    : never;

export const Routes = {
  guildEmojis: (guildId: string) =>
    `/guilds/${guildId}/emojis` as TypedRoute<{
      GET: { response: EmojiObject[] };
      POST: { body: CreateGuildEmojiJSONParams; response: EmojiObject };
    }>,

  guildEmoji: (guildId: string, emojiId: string) =>
    `/guilds/${guildId}/emojis/${emojiId}` as TypedRoute<{
      GET: { response: EmojiObject };
      PATCH: { body: ModifyGuildEmojiJSONParams; response: EmojiObject };
      DELETE: { response: undefined };
    }>,

  applicationEmojis: (applicationId: string) =>
    `/applications/${applicationId}/emojis` as TypedRoute<{
      GET: { response: ListApplicationEmojisResponse };
      POST: { body: CreateApplicationEmojiJSONParams; response: EmojiObject };
    }>,

  applicationEmoji: (applicationId: string, emojiId: string) =>
    `/applications/${applicationId}/emojis/${emojiId}` as TypedRoute<{
      GET: { response: EmojiObject };
      PATCH: { body: ModifyApplicationEmojiJSONParams; response: EmojiObject };
      DELETE: { response: undefined };
    }>,

  applicationEntitlements: (applicationId: string) =>
    `/applications/${applicationId}/entitlements` as TypedRoute<{
      GET: { query?: ListEntitlementsQueryStringParams; response: EntitlementObject[] };
      POST: { body: CreateTestEntitlementJSONParams; response: EntitlementObject };
    }>,

  applicationEntitlement: (applicationId: string, entitlementId: string) =>
    `/applications/${applicationId}/entitlements/${entitlementId}` as TypedRoute<{
      GET: { response: EntitlementObject };
      DELETE: { response: undefined };
    }>,

  consumeEntitlement: (applicationId: string, entitlementId: string) =>
    `/applications/${applicationId}/entitlements/${entitlementId}/consume` as TypedRoute<{
      POST: { response: undefined };
    }>,

  guildScheduledEvents: (guildId: string) =>
    `/guilds/${guildId}/scheduled-events` as TypedRoute<{
      GET: {
        query?: ListScheduledEventsGuildQueryStringParams;
        response: GuildScheduledEventObject[];
      };
      POST: { body: CreateGuildScheduledEventJSONParams; response: GuildScheduledEventObject };
    }>,

  guildScheduledEvent: (guildId: string, eventId: string) =>
    `/guilds/${guildId}/scheduled-events/${eventId}` as TypedRoute<{
      GET: { query?: GetGuildScheduledEventQueryStringParams; response: GuildScheduledEventObject };
      PATCH: { body: ModifyGuildScheduledEventJSONParams; response: GuildScheduledEventObject };
      DELETE: { response: undefined };
    }>,

  guildScheduledEventUsers: (guildId: string, eventId: string) =>
    `/guilds/${guildId}/scheduled-events/${eventId}/users` as TypedRoute<{
      GET: {
        query?: GetGuildScheduledEventUsersQueryStringParams;
        response: GuildScheduledEventUserObject[];
      };
    }>,

  guildTemplate: (code: string) =>
    `/guilds/templates/${code}` as TypedRoute<{
      GET: { response: GuildTemplateObject };
      POST: { body: CreateGuildFromTemplateJSONParams; response: GuildEntity };
    }>,

  guildTemplates: (guildId: string) =>
    `/guilds/${guildId}/templates` as TypedRoute<{
      GET: { response: GuildTemplateObject[] };
      POST: { body: CreateGuildTemplateJSONParams; response: GuildTemplateObject };
    }>,

  guildTemplateByCode: (guildId: string, code: string) =>
    `/guilds/${guildId}/templates/${code}` as TypedRoute<{
      PUT: { response: GuildTemplateObject };
      PATCH: { body: ModifyGuildTemplateJSONParams; response: GuildTemplateObject };
      DELETE: { response: GuildTemplateObject };
    }>,

  lobbies: () =>
    `/lobbies` as TypedRoute<{
      POST: { body: CreateLobbyJSONParams; response: LobbyObject };
    }>,

  lobby: (lobbyId: string) =>
    `/lobbies/${lobbyId}` as TypedRoute<{
      GET: { response: LobbyObject };
      PATCH: { body: ModifyLobbyJSONParams; response: LobbyObject };
      DELETE: { response: undefined };
    }>,

  lobbyMember: (lobbyId: string, userId: string) =>
    `/lobbies/${lobbyId}/members/${userId}` as TypedRoute<{
      PUT: { body: LobbyMemberJSONParams; response: LobbyMemberObject };
      DELETE: { response: undefined };
    }>,

  leaveLobby: (lobbyId: string) =>
    `/lobbies/${lobbyId}/members/@me` as TypedRoute<{
      DELETE: { response: undefined };
    }>,

  linkChannelLobby: (lobbyId: string) =>
    `/lobbies/${lobbyId}/channel-linking` as TypedRoute<{
      PATCH: { body: LinkChannelLobbyJSONParams; response: LobbyObject };
    }>,

  pollAnswerVoters: (channelId: string, messageId: string, answerId: string) =>
    `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as TypedRoute<{
      GET: { query?: GetAnswerVotersQueryStringParams; response: GetAnswerVotersResponse };
    }>,

  endPoll: (channelId: string, messageId: string) =>
    `/channels/${channelId}/polls/${messageId}/expire` as TypedRoute<{
      POST: { response: MessageEntity };
    }>,

  applicationSKUs: (applicationId: string) =>
    `/applications/${applicationId}/skus` as TypedRoute<{
      GET: { response: SKUObject[] };
    }>,

  sendSoundboardSound: (channelId: string) =>
    `/channels/${channelId}/send-soundboard-sound` as TypedRoute<{
      POST: { body: SendSoundboardSoundJSONParams; response: undefined };
    }>,

  defaultSoundboardSounds: () =>
    `/soundboard-default-sounds` as TypedRoute<{
      GET: { response: SoundboardSoundObject[] };
    }>,

  guildSoundboardSounds: (guildId: string) =>
    `/guilds/${guildId}/soundboard-sounds` as TypedRoute<{
      GET: { response: { items: SoundboardSoundObject[] } };
      POST: { body: CreateGuildSoundboardSoundFormParams; response: SoundboardSoundObject };
    }>,

  guildSoundboardSound: (guildId: string, soundId: string) =>
    `/guilds/${guildId}/soundboard-sounds/${soundId}` as TypedRoute<{
      GET: { response: SoundboardSoundObject };
      PATCH: { body: ModifyGuildSoundboardSoundJSONParams; response: SoundboardSoundObject };
      DELETE: { response: undefined };
    }>,

  stageInstances: () =>
    `/stage-instances` as TypedRoute<{
      POST: { body: CreateStageInstanceJSONParams; response: StageInstanceObject };
    }>,

  stageInstance: (channelId: string) =>
    `/stage-instances/${channelId}` as TypedRoute<{
      GET: { response: StageInstanceObject };
      PATCH: { body: ModifyStageInstanceJSONParams; response: StageInstanceObject };
      DELETE: { response: undefined };
    }>,

  sticker: (stickerId: string) =>
    `/stickers/${stickerId}` as TypedRoute<{
      GET: { response: StickerObject };
    }>,

  stickerPacks: () =>
    `/sticker-packs` as TypedRoute<{
      GET: { response: ListStickerPacksResponse };
    }>,

  stickerPack: (packId: string) =>
    `/sticker-packs/${packId}` as TypedRoute<{
      GET: { response: StickerPackObject };
    }>,

  guildStickers: (guildId: string) =>
    `/guilds/${guildId}/stickers` as TypedRoute<{
      GET: { response: StickerObject[] };
      POST: { body: CreateGuildStickerFormParams; response: StickerObject };
    }>,

  guildSticker: (guildId: string, stickerId: string) =>
    `/guilds/${guildId}/stickers/${stickerId}` as TypedRoute<{
      GET: { response: StickerObject };
      PATCH: { body: ModifyGuildStickerJSONParams; response: StickerObject };
      DELETE: { response: undefined };
    }>,

  voiceRegions: () =>
    `/voice/regions` as TypedRoute<{
      GET: { response: VoiceRegionObject[] };
    }>,

  currentUserVoiceState: (guildId: string) =>
    `/guilds/${guildId}/voice-states/@me` as TypedRoute<{
      GET: { response: VoiceStateObject };
      PATCH: { body: ModifyCurrentUserVoiceStateJSONParams; response: undefined };
    }>,

  userVoiceState: (guildId: string, userId: string) =>
    `/guilds/${guildId}/voice-states/${userId}` as TypedRoute<{
      GET: { response: VoiceStateObject };
      PATCH: { body: ModifyUserVoiceStateJSONParams; response: undefined };
    }>,

  currentUser: () =>
    `/users/@me` as TypedRoute<{
      GET: { response: UserObject };
      PATCH: { body: ModifyCurrentUserJSONParams; response: UserObject };
    }>,

  user: (userId: string) =>
    `/users/${userId}` as TypedRoute<{
      GET: { response: UserObject };
    }>,

  currentUserGuilds: () =>
    `/users/@me/guilds` as TypedRoute<{
      GET: { query?: GetCurrentUserGuildsQueryStringParams; response: Partial<GuildEntity>[] };
    }>,

  currentUserGuildMember: (guildId: string) =>
    `/users/@me/guilds/${guildId}/member` as TypedRoute<{
      GET: { response: GuildMemberEntity };
    }>,

  leaveGuild: (guildId: string) =>
    `/users/@me/guilds/${guildId}` as TypedRoute<{
      DELETE: { response: undefined };
    }>,

  userChannels: () =>
    `/users/@me/channels` as TypedRoute<{
      POST: { body: CreateDMJSONParams | CreateGroupDMJSONParams; response: DMChannelEntity };
    }>,

  currentUserConnections: () =>
    `/users/@me/connections` as TypedRoute<{
      GET: { response: ConnectionObject[] };
    }>,

  currentUserApplicationRoleConnection: (applicationId: string) =>
    `/users/@me/applications/${applicationId}/role-connection` as TypedRoute<{
      GET: { response: ApplicationRoleConnectionObject };
      PUT: {
        body: UpdateCurrentUserApplicationRoleConnectionJSONParams;
        response: ApplicationRoleConnectionObject;
      };
    }>,

  skuSubscriptions: (skuId: string) =>
    `/skus/${skuId}/subscriptions` as TypedRoute<{
      GET: { query?: ListSKUSubscriptionsQueryStringParams; response: SubscriptionObject[] };
    }>,

  skuSubscription: (skuId: string, subscriptionId: string) =>
    `/skus/${skuId}/subscriptions/${subscriptionId}` as TypedRoute<{
      GET: { response: SubscriptionObject };
    }>,
} as const satisfies Record<string, (...args: readonly string[]) => TypedRoute>;
