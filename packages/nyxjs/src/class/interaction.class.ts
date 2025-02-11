import {
  type ActionRowEntity,
  type ApplicationCommandInteractionDataEntity,
  type ApplicationIntegrationType,
  type AttachmentEntity,
  BitFieldManager,
  type BitwisePermissionFlags,
  type InteractionCallbackMessagesEntity,
  type InteractionCallbackModalEntity,
  InteractionCallbackType,
  type InteractionContextType,
  type InteractionDataEntity,
  InteractionEntity,
  InteractionType,
  type Locale,
  type MessageComponentInteractionDataEntity,
  MessageFlags,
  type ModalSubmitInteractionDataEntity,
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

export class Interaction extends BaseClass<InteractionEntity> {
  readonly #appPermissions: BitFieldManager<BitwisePermissionFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof InteractionEntity>> = {},
  ) {
    super(client, InteractionEntity as z.ZodSchema, data as InteractionEntity);
    this.#appPermissions = new BitFieldManager(this.data.app_permissions);
  }

  // Base properties
  get id(): Snowflake {
    return this.data.id;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get type(): InteractionType {
    return this.data.type;
  }

  get intData(): InteractionDataEntity | null {
    return this.data.data ?? null;
  }

  get guild(): Guild | null {
    return this.data.guild ? new Guild(this.client, this.data.guild) : null;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get channel(): Channel | null {
    return this.data.channel
      ? new Channel(this.client, this.data.channel)
      : null;
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id ?? null;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get token(): string {
    return this.data.token;
  }

  get version(): 1 {
    return this.data.version;
  }

  // get message(): Message | null {
  //   return this.data.message
  //     ? new Message(this.client, this.data.message)
  //     : null;
  // }

  get appPermissions(): BitFieldManager<BitwisePermissionFlags> {
    return this.#appPermissions;
  }

  get locale(): Locale | null {
    return this.data.locale ?? null;
  }

  get guildLocale(): Locale | null {
    return this.data.guild_locale ?? null;
  }

  get entitlements(): Entitlement[] {
    return this.data.entitlements.map(
      (entitlement) => new Entitlement(this.client, entitlement),
    );
  }

  get authorizingIntegrationOwners(): Record<
    ApplicationIntegrationType,
    Snowflake
  > {
    return this.data.authorizing_integration_owners;
  }

  get context(): InteractionContextType | null {
    return this.data.context ?? null;
  }

  get commandName(): string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }

    return this.intData?.data.name ?? null;
  }

  get commandId(): string | null {
    if (!this.isApplicationCommand()) {
      return null;
    }
    return this.intData?.data.id;
  }

  get commandType(): number | null {
    if (!this.isApplicationCommand()) {
      return null;
    }

    return this.intData?.data.type;
  }

  get componentType(): number | null {
    if (!this.isMessageComponent()) {
      return null;
    }
    return this.data.data.component_type;
  }

  get customId(): string | null {
    if (!(this.isMessageComponent() || this.isModalSubmit())) {
      return null;
    }
    return this.data.data.custom_id;
  }

  get modalComponents(): ActionRowEntity[] {
    if (!this.isModalSubmit()) {
      return [];
    }

    return this.data.data.components;
  }

  get subCommandName(): string | null {
    if (!(this.isApplicationCommand() && this.data.data.options)) {
      return null;
    }
    const subCommand = this.data.data.options.find(
      (opt) => opt.type === 1 || opt.type === 2,
    );
    return subCommand?.name ?? null;
  }

  get subCommandGroupName(): string | null {
    if (!(this.isApplicationCommand() && this.data.data.options)) {
      return null;
    }
    const group = this.data.data.options.find((opt) => opt.type === 2);
    return group?.name ?? null;
  }

  get createdTimestamp(): number {
    return Number(BigInt(this.id) >> 22n) + 1420070400000;
  }

  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  isApplicationCommand(): this is Interaction & {
    data: {
      type: InteractionType.ApplicationCommand;
      data: ApplicationCommandInteractionDataEntity;
    };
  } {
    return (
      this.type === InteractionType.ApplicationCommand && this.intData !== null
    );
  }

  isMessageComponent(): this is Interaction & {
    data: {
      type: InteractionType.MessageComponent;
      data: MessageComponentInteractionDataEntity;
    };
  } {
    return (
      this.type === InteractionType.MessageComponent && this.intData !== null
    );
  }

  isModalSubmit(): this is Interaction & {
    data: {
      type: InteractionType.ModalSubmit;
      data: ModalSubmitInteractionDataEntity;
    };
  } {
    return this.type === InteractionType.ModalSubmit && this.intData !== null;
  }

  isAutocomplete(): boolean {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  isPing(): boolean {
    return this.type === InteractionType.Ping;
  }

  getOption<T = unknown>(name: string): T | null {
    if (!(this.isApplicationCommand() && this.data.data.options)) {
      return null;
    }
    const option = this.data.data.options.find((opt) => opt.name === name);

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
    if (!(this.isApplicationCommand() && this.data.data.resolved?.users)) {
      return null;
    }
    const userId = this.getOption<string>(name);
    if (!userId) {
      return null;
    }
    const userData = this.data.data.resolved.users[userId];
    if (!userData) {
      return null;
    }
    return new User(this.client, userData);
  }

  getChannelOption(name: string): Channel | null {
    if (!(this.isApplicationCommand() && this.data.data.resolved?.channels)) {
      return null;
    }
    const channelId = this.getOption<string>(name);
    if (!channelId) {
      return null;
    }
    const channelData = this.data.data.resolved.channels[channelId];
    if (!channelData) {
      return null;
    }
    return new Channel(channelData);
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

    if (this.data.data.resolved?.users?.[mentionableId]) {
      return new User(
        this.client,
        this.data.data.resolved.users[mentionableId],
      );
    }

    if (this.data.data.resolved?.members?.[mentionableId]) {
      return new GuildMember(this.data.data.resolved.members[mentionableId]);
    }

    return mentionableId;
  }

  getAttachmentOption(name: string): AttachmentEntity | null {
    if (
      !(this.isApplicationCommand() && this.data.data.resolved?.attachments)
    ) {
      return null;
    }
    const attachmentId = this.getOption<string>(name);
    if (!attachmentId) {
      return null;
    }

    return this.data.data.resolved.attachments[
      attachmentId
    ] as AttachmentEntity;
  }

  getSubCommandOptions(): unknown[] {
    if (!(this.isApplicationCommand() && this.data.data.options)) {
      return [];
    }

    const subCommand = this.data.data.options.find((opt) => opt.type === 1);
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
    return this.guildId !== null;
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

  toJson(): InteractionEntity {
    return { ...this.data };
  }
}

export const InteractionSchema = z.instanceof(Interaction);
