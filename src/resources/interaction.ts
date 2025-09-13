export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
  MessageComponent = 3,
  ApplicationCommandAutocomplete = 4,
  ModalSubmit = 5,
}

export enum InteractionCallbackType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
  ApplicationCommandAutocompleteResult = 8,
  Modal = 9,
  PremiumRequired = 10,
  LaunchActivity = 12,
}

export enum InteractionContextType {
  Guild = 0,
  BotDm = 1,
  PrivateChannel = 2,
}

export interface InteractionCallbackActivityInstanceEntity {
  id: string;
}

export interface InteractionCommandOptionEntity {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string | number | boolean;
  options?: InteractionCommandOptionEntity[];
  focused?: boolean;
}

export interface StringInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.String;
  value: string;
}

export interface IntegerInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Integer;
  value: number;
}

export interface NumberInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Number;
  value: number;
}

export interface BooleanInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Boolean;
  value: boolean;
}

export interface UserInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.User;
  value: string;
}

export interface ChannelInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Channel;
  value: string;
}

export interface RoleInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Role;
  value: string;
}

export interface MentionableInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Mentionable;
  value: string;
}

export interface AttachmentInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  type: ApplicationCommandOptionType.Attachment;
  value: string;
}

export interface SubCommandInteractionOptionEntity
  extends Omit<InteractionCommandOptionEntity, "value" | "focused"> {
  type: ApplicationCommandOptionType.SubCommand;
  options?: AnySimpleInteractionCommandOptionEntity[];
}

export interface SubCommandGroupInteractionOptionEntity
  extends Omit<InteractionCommandOptionEntity, "value" | "focused"> {
  type: ApplicationCommandOptionType.SubCommandGroup;
  options: SubCommandInteractionOptionEntity[];
}

export type AnySimpleInteractionCommandOptionEntity =
  | StringInteractionCommandOptionEntity
  | IntegerInteractionCommandOptionEntity
  | NumberInteractionCommandOptionEntity
  | BooleanInteractionCommandOptionEntity
  | UserInteractionCommandOptionEntity
  | ChannelInteractionCommandOptionEntity
  | RoleInteractionCommandOptionEntity
  | MentionableInteractionCommandOptionEntity
  | AttachmentInteractionCommandOptionEntity;

export type AnyComplexInteractionCommandOptionEntity =
  | SubCommandInteractionOptionEntity
  | SubCommandGroupInteractionOptionEntity;

export type AnyInteractionCommandOptionEntity =
  | AnySimpleInteractionCommandOptionEntity
  | AnyComplexInteractionCommandOptionEntity;

export interface InteractionResolvedDataEntity {
  users?: Record<string, UserEntity>;
  members?: Record<string, Omit<GuildMemberEntity, "user" | "deaf" | "mute">>;
  roles?: Record<string, RoleEntity>;
  channels?: Record<string, Partial<AnyChannelEntity>>;
  attachments?: Record<string, AttachmentEntity>;
  messages?: Record<string, Partial<MessageEntity>>;
}

export interface ApplicationCommandInteractionDataEntity {
  id: string;
  name: string;
  type: ApplicationCommandType;
  resolved?: InteractionResolvedDataEntity;
  options?: AnyInteractionCommandOptionEntity[];
  guild_id?: string;
  target_id?: string;
}

export interface MessageComponentInteractionDataEntity {
  custom_id: string;
  component_type: ComponentType;
  values?: SelectMenuOptionEntity[];
  resolved?: InteractionResolvedDataEntity;
}

export interface ModalSubmitInteractionDataEntity {
  custom_id: string;
  components: AnyComponentEntity[];
}

export type InteractionDataEntity =
  | ApplicationCommandInteractionDataEntity
  | MessageComponentInteractionDataEntity
  | ModalSubmitInteractionDataEntity;

export interface MessageInteractionEntity {
  id: string;
  type: InteractionType;
  name: string;
  user: UserEntity;
  member?: Partial<GuildMemberEntity>;
}

export interface InteractionCallbackEntity {
  id: string;
  type: InteractionType;
  activity_instance_id?: string;
  response_message_id?: string;
  response_message_loading?: boolean;
  response_message_ephemeral?: boolean;
}

export interface InteractionCallbackResourceEntity {
  type: InteractionCallbackType;
  activity_instance?: InteractionCallbackActivityInstanceEntity;
  message?: MessageEntity;
}

export interface InteractionCallbackResponseEntity {
  interaction: InteractionCallbackEntity;
  resource?: InteractionCallbackResourceEntity;
}

export interface InteractionCallbackMessagesEntity {
  tts?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  flags?: MessageFlags;
  components?: AnyComponentEntity[];
  attachments?: AttachmentEntity[];
  poll?: PollCreateRequestEntity;
}

export interface InteractionCallbackModalEntity {
  custom_id: string;
  title: string;
  components: AnyComponentEntity[];
}

export interface InteractionCallbackAutocompleteEntity {
  choices: ApplicationCommandOptionChoiceEntity[];
}

export interface InteractionCallbackActivityEntity {
  activity_instance_id: string;
}

type InteractionCallbackDataMap = {
  [InteractionCallbackType.Pong]: undefined;
  [InteractionCallbackType.ChannelMessageWithSource]: InteractionCallbackMessagesEntity;
  [InteractionCallbackType.DeferredChannelMessageWithSource]: InteractionCallbackMessagesEntity;
  [InteractionCallbackType.DeferredUpdateMessage]: InteractionCallbackMessagesEntity;
  [InteractionCallbackType.UpdateMessage]: InteractionCallbackMessagesEntity;
  [InteractionCallbackType.ApplicationCommandAutocompleteResult]: InteractionCallbackAutocompleteEntity;
  [InteractionCallbackType.Modal]: InteractionCallbackModalEntity;
  [InteractionCallbackType.PremiumRequired]: undefined;
  [InteractionCallbackType.LaunchActivity]: InteractionCallbackActivityEntity;
};

export interface InteractionResponseEntity<
  T extends InteractionCallbackType = InteractionCallbackType,
> {
  type: T;
  data?: InteractionCallbackDataMap[T];
}

export interface InteractionEntity {
  id: string;
  application_id: string;
  type: InteractionType;
  data?: InteractionDataEntity;
  guild?: Partial<GuildEntity>;
  guild_id?: string;
  channel?: Partial<AnyChannelEntity>;
  channel_id?: string;
  member?: GuildMemberEntity;
  user?: UserEntity;
  token: string;
  version: 1;
  message?: MessageEntity;
  app_permissions: string;
  locale?: LocaleValues;
  guild_locale?: LocaleValues;
  entitlements: EntitlementEntity[];
  authorizing_integration_owners: Record<ApplicationIntegrationType, string | "0">;
  context?: InteractionContextType;
  attachment_size_limit: number;
}

export interface GuildInteractionEntity
  extends Omit<InteractionEntity, "guild" | "guild_id" | "member" | "guild_locale" | "context"> {
  context: InteractionContextType.Guild;
  guild_id: string;
  guild: Partial<GuildEntity>;
  member: GuildMemberEntity;
  guild_locale?: LocaleValues;
}

export interface BotDmInteractionEntity
  extends Omit<
    InteractionEntity,
    "guild" | "guild_id" | "guild_locale" | "member" | "channel" | "channel_id" | "user" | "context"
  > {
  context: InteractionContextType.BotDm;
  channel_id: string;
  channel: Partial<AnyChannelEntity>;
  user: UserEntity;
}

export interface PrivateChannelInteractionEntity
  extends Omit<
    InteractionEntity,
    "guild" | "guild_id" | "guild_locale" | "member" | "channel" | "channel_id" | "user" | "context"
  > {
  context: InteractionContextType.PrivateChannel;
  channel_id: string;
  channel: Partial<AnyChannelEntity>;
  user: UserEntity;
}

export type AnyInteractionEntity =
  | GuildInteractionEntity
  | BotDmInteractionEntity
  | PrivateChannelInteractionEntity;

export const InteractionRoutes = {
  createResponse: (interactionId: string, interactionToken: string) =>
    `/interactions/${interactionId}/${interactionToken}/callback` as const,
  getOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  editOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  deleteOriginalResponse: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/@original` as const,
  createFollowupMessage: (applicationId: string, interactionToken: string) =>
    `/webhooks/${applicationId}/${interactionToken}` as const,
  getFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  editFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
  deleteFollowupMessage: (applicationId: string, interactionToken: string, messageId: string) =>
    `/webhooks/${applicationId}/${interactionToken}/messages/${messageId}` as const,
} as const satisfies RouteBuilder;

export class InteractionRouter extends BaseRouter {
  createResponse(
    interactionId: string,
    interactionToken: string,
    options: InteractionResponseEntity,
    withResponse = false,
  ): Promise<InteractionCallbackResponseEntity | undefined> {
    return this.rest.post(InteractionRoutes.createResponse(interactionId, interactionToken), {
      body: JSON.stringify(options),
      query: { with_response: withResponse },
    });
  }

  getOriginalResponse(applicationId: string, interactionToken: string): Promise<MessageEntity> {
    return this.rest.get(InteractionRoutes.getOriginalResponse(applicationId, interactionToken));
  }

  editOriginalResponse(
    applicationId: string,
    interactionToken: string,
    options: RESTWebhookMessageEditJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.patch(
      InteractionRoutes.editOriginalResponse(applicationId, interactionToken),
      {
        body: JSON.stringify(body),
        files: files as FileInput[] | undefined,
      },
    );
  }

  deleteOriginalResponse(applicationId: string, interactionToken: string): Promise<void> {
    return this.rest.delete(
      InteractionRoutes.deleteOriginalResponse(applicationId, interactionToken),
    );
  }

  createFollowupMessage(
    applicationId: string,
    interactionToken: string,
    options: RESTWebhookExecuteJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.post(
      InteractionRoutes.createFollowupMessage(applicationId, interactionToken),
      {
        body: JSON.stringify(body),
        files,
      },
    );
  }

  getFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<MessageEntity> {
    return this.rest.get(
      InteractionRoutes.getFollowupMessage(applicationId, interactionToken, messageId),
    );
  }

  editFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
    options: RESTWebhookMessageEditJSONParams,
  ): Promise<MessageEntity> {
    const { files, ...body } = options;
    return this.rest.patch(
      InteractionRoutes.editFollowupMessage(applicationId, interactionToken, messageId),
      {
        body: JSON.stringify(body),
        files: files as FileInput[] | undefined,
      },
    );
  }

  deleteFollowupMessage(
    applicationId: string,
    interactionToken: string,
    messageId: string,
  ): Promise<void> {
    return this.rest.delete(
      InteractionRoutes.deleteFollowupMessage(applicationId, interactionToken, messageId),
    );
  }
}
