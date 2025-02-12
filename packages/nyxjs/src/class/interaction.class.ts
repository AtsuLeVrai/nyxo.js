import {
  type ActionRowEntity,
  AnyInteractionEntity,
  type ApplicationCommandInteractionDataEntity,
  type AttachmentEntity,
  BitFieldManager,
  type BitwisePermissionFlags,
  type BotDmInteractionEntity,
  type GuildInteractionEntity,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  InteractionCallbackType,
  InteractionContextType,
  type InteractionDataEntity,
  InteractionType,
  type Locale,
  type MessageComponentInteractionDataEntity,
  MessageFlags,
  type ModalSubmitInteractionDataEntity,
  type PrivateChannelInteractionEntity,
  type Snowflake,
} from "@nyxjs/core";
import type {
  EditWebhookMessageSchema,
  ExecuteWebhookSchema,
} from "@nyxjs/rest";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Channel } from "./channel.class.js";
import { Entitlement } from "./entitlement.class.js";
import { GuildMember } from "./guild-member.class.js";
import { Guild } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

export class Interaction extends BaseClass<AnyInteractionEntity> {
  readonly #appPermissions: BitFieldManager<BitwisePermissionFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof AnyInteractionEntity>> = {},
  ) {
    super(
      client,
      AnyInteractionEntity as z.ZodSchema,
      entity as AnyInteractionEntity,
    );
    this.#appPermissions = new BitFieldManager(this.entity.app_permissions);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get applicationId(): Snowflake {
    return this.entity.application_id;
  }

  get type(): InteractionType {
    return this.entity.type;
  }

  get data(): InteractionDataEntity | null {
    return this.entity.data ?? null;
  }

  get guild(): Guild | null {
    if (!this.isGuildInteraction()) {
      return null;
    }

    return this.entity.guild ? new Guild(this.client, this.entity.guild) : null;
  }

  get guildId(): Snowflake | null {
    if (!this.isGuildInteraction()) {
      return null;
    }
    return this.entity.guild_id;
  }

  get channel(): Channel | null {
    return this.entity.channel
      ? new Channel(this.client, this.entity.channel)
      : null;
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  get member(): GuildMember | null {
    if (!this.isGuildInteraction()) {
      return null;
    }

    return this.entity.member
      ? new GuildMember(this.client, this.entity.member)
      : null;
  }

  get user(): User | null {
    if (this.isGuildInteraction()) {
      return null;
    }

    if ("user" in this.entity && this.entity.user) {
      return new User(this.client, this.entity.user);
    }

    return null;
  }

  get token(): string {
    return this.entity.token;
  }

  get version(): 1 {
    return this.entity.version;
  }

  get appPermissions(): BitFieldManager<BitwisePermissionFlags> {
    return this.#appPermissions;
  }

  get locale(): Locale | null {
    return this.entity.locale ?? null;
  }

  get guildLocale(): Locale | null {
    if (!this.isGuildInteraction()) {
      return null;
    }

    return this.entity.guild_locale ?? null;
  }

  get entitlements(): Entitlement[] {
    return this.entity.entitlements.map(
      (entitlement) => new Entitlement(this.client, entitlement),
    );
  }

  get authorizingIntegrationOwners(): Record<string, Snowflake> {
    return this.entity.authorizing_integration_owners;
  }

  get context(): InteractionContextType | null {
    return this.entity.context ?? null;
  }

  get commandName(): string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    return this.data.name;
  }

  get commandId(): string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    return this.data.id;
  }

  get commandType(): number | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    return this.data.type;
  }

  get componentType(): number | null {
    if (!this.isMessageComponent()) {
      return null;
    }
    return this.data.component_type;
  }

  get customId(): string | null {
    if (!(this.isMessageComponent() || this.isModalSubmit())) {
      return null;
    }
    return this.data.custom_id;
  }

  get modalComponents(): ActionRowEntity[] {
    if (!this.isModalSubmit()) {
      return [];
    }
    return this.data.components;
  }

  get subCommandName(): string | null {
    if (!(this.isApplicationCommand() && this.data?.options)) {
      return null;
    }
    const subCommand = this.data.options.find(
      (opt) => opt.type === 1 || opt.type === 2,
    );
    return subCommand?.name ?? null;
  }

  get subCommandGroupName(): string | null {
    if (!(this.isApplicationCommand() && this.data.options)) {
      return null;
    }
    const group = this.data.options.find((opt) => opt.type === 2);
    return group?.name ?? null;
  }

  get createdTimestamp(): number {
    return Number(BigInt(this.id) >> 22n) + 1420070400000;
  }

  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  isGuildInteraction(): this is Interaction & {
    entity: GuildInteractionEntity;
  } {
    return this.entity.context === InteractionContextType.Guild;
  }

  isBotDmInteraction(): this is Interaction & {
    entity: BotDmInteractionEntity;
  } {
    return this.entity.context === InteractionContextType.BotDm;
  }

  isPrivateChannelInteraction(): this is Interaction & {
    entity: PrivateChannelInteractionEntity;
  } {
    return this.entity.context === InteractionContextType.PrivateChannel;
  }

  isApplicationCommand(): this is Interaction & {
    data: ApplicationCommandInteractionDataEntity;
  } {
    return (
      this.type === InteractionType.ApplicationCommand && this.data !== null
    );
  }

  isMessageComponent(): this is Interaction & {
    data: MessageComponentInteractionDataEntity;
  } {
    return this.type === InteractionType.MessageComponent && this.data !== null;
  }

  isModalSubmit(): this is Interaction & {
    data: ModalSubmitInteractionDataEntity;
  } {
    return this.type === InteractionType.ModalSubmit && this.data !== null;
  }

  isAutocomplete(): boolean {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  isPing(): boolean {
    return this.type === InteractionType.Ping;
  }

  getOption<T = unknown>(name: string): T | null {
    if (!(this.isApplicationCommand() && this.data?.options)) {
      return null;
    }
    const option = this.data.options.find((opt) => opt.name === name);
    // @ts-expect-error
    return option?.value as T | null;
  }

  getStringOption(name: string): string | null {
    return this.getOption<string>(name);
  }

  getIntegerOption(name: string): number | null {
    return this.getOption<number>(name);
  }

  getBooleanOption(name: string): boolean | null {
    return this.getOption<boolean>(name);
  }

  getUserOption(name: string): User | null {
    if (!(this.isApplicationCommand() && this.data?.resolved?.users)) {
      return null;
    }
    const userId = this.getOption<string>(name);
    if (!userId) {
      return null;
    }
    const userData = this.data.resolved.users[userId];
    if (!userData) {
      return null;
    }
    return new User(this.client, userData);
  }

  getChannelOption(name: string): Channel | null {
    if (!(this.isApplicationCommand() && this.data.resolved?.channels)) {
      return null;
    }
    const channelId = this.getOption<string>(name);
    if (!channelId) {
      return null;
    }
    const channelData = this.data.resolved.channels[channelId];
    if (!channelData) {
      return null;
    }
    return new Channel(this.client, channelData);
  }

  getRoleOption(name: string): string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    return this.getOption<string>(name);
  }

  getMentionableOption(name: string): User | GuildMember | string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    const mentionableId = this.getOption<string>(name);
    if (!mentionableId) {
      return null;
    }

    if (this.data.resolved?.users?.[mentionableId]) {
      return new User(this.client, this.data.resolved.users[mentionableId]);
    }

    if (this.data.resolved?.members?.[mentionableId]) {
      return new GuildMember(
        this.client,
        this.data.resolved.members[mentionableId],
      );
    }

    return mentionableId;
  }

  getAttachmentOption(name: string): AttachmentEntity | null {
    if (!(this.isApplicationCommand() && this.data.resolved?.attachments)) {
      return null;
    }
    const attachmentId = this.getOption<string>(name);
    if (!attachmentId) {
      return null;
    }
    return this.data.resolved.attachments[attachmentId] as AttachmentEntity;
  }

  getSubCommandOptions(): unknown[] {
    if (!(this.isApplicationCommand() && this.data.options)) {
      return [];
    }
    const subCommand = this.data.options.find((opt) => opt.type === 1);
    return subCommand?.options ?? [];
  }

  async reply(
    options: z.input<typeof InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    await this.client.rest.interactions.createInteractionResponse(
      this.id,
      this.token,
      {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: options,
      },
    );
  }

  async replyEphemeral(
    options: z.input<typeof InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    await this.reply({
      ...options,
      flags: (options.flags ?? 0) | MessageFlags.Ephemeral,
    });
  }

  async deferReply(ephemeral = false): Promise<void> {
    await this.client.rest.interactions.createInteractionResponse(
      this.id,
      this.token,
      {
        type: InteractionCallbackType.DeferredChannelMessageWithSource,
        data: {
          flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        },
      },
    );
  }

  async showModal(options: InteractionCallbackModalEntity): Promise<void> {
    await this.client.rest.interactions.createInteractionResponse(
      this.id,
      this.token,
      {
        type: InteractionCallbackType.Modal,
        data: options,
      },
    );
  }

  async editReply(options: EditWebhookMessageSchema): Promise<Message> {
    const response =
      await this.client.rest.interactions.editOriginalInteractionResponse(
        this.applicationId,
        this.token,
        options,
      );
    return new Message(this.client, response);
  }

  async deleteReply(): Promise<void> {
    await this.client.rest.interactions.deleteOriginalInteractionResponse(
      this.applicationId,
      this.token,
    );
  }

  async fetchReply(): Promise<Message> {
    const response =
      await this.client.rest.interactions.getOriginalInteractionResponse(
        this.applicationId,
        this.token,
      );
    return new Message(this.client, response);
  }

  async followUp(options: ExecuteWebhookSchema): Promise<Message> {
    const response = await this.client.rest.interactions.createFollowupMessage(
      this.applicationId,
      this.token,
      options,
    );
    return new Message(this.client, response);
  }

  inGuild(): this is Interaction & { guildId: Snowflake } {
    return this.isGuildInteraction();
  }

  hasExpired(): boolean {
    return Date.now() > this.createdTimestamp + 15 * 60 * 1000;
  }

  botHasPermission(permission: BitwisePermissionFlags): boolean {
    return this.#appPermissions.has(permission);
  }

  async fetchOptionUser(name: string): Promise<User | null> {
    const userId = this.getStringOption(name);
    if (!userId) {
      return null;
    }
    try {
      const userData = await this.client.rest.users.getUser(userId);
      return new User(this.client, userData);
    } catch {
      return null;
    }
  }

  async fetchOptionMember(name: string): Promise<GuildMember | null> {
    if (!this.inGuild()) {
      return null;
    }

    const userId = this.getStringOption(name);
    if (!userId) {
      return null;
    }

    try {
      const memberData = await this.client.rest.guilds.getGuildMember(
        this.guildId,
        userId,
      );
      return new GuildMember(this.client, memberData);
    } catch {
      return null;
    }
  }

  memberHasRole(roleId: Snowflake): boolean {
    return this.member?.roles.includes(roleId) ?? false;
  }

  toJson(): AnyInteractionEntity {
    return { ...this.entity };
  }
}

export const InteractionSchema = z.instanceof(Interaction);
