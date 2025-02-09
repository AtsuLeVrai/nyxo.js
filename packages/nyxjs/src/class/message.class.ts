import { MessageCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class Message {
  readonly #data: MessageCreateEntity;

  constructor(data: MessageCreateEntity) {
    this.#data = MessageCreateEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get channelId(): unknown {
    return this.#data.channel_id;
  }

  get author(): object | null {
    return this.#data.author ? { ...this.#data.author } : null;
  }

  get content(): string {
    return this.#data.content;
  }

  get timestamp(): string {
    return this.#data.timestamp;
  }

  get editedTimestamp(): string | null {
    return this.#data.edited_timestamp ?? null;
  }

  get tts(): boolean {
    return Boolean(this.#data.tts);
  }

  get mentionEveryone(): boolean {
    return Boolean(this.#data.mention_everyone);
  }

  get mentionRoles(): unknown[] {
    return Array.isArray(this.#data.mention_roles)
      ? [...this.#data.mention_roles]
      : [];
  }

  get attachments(): object[] {
    return Array.isArray(this.#data.attachments)
      ? [...this.#data.attachments]
      : [];
  }

  get embeds(): object[] {
    return Array.isArray(this.#data.embeds) ? [...this.#data.embeds] : [];
  }

  get pinned(): boolean {
    return Boolean(this.#data.pinned);
  }

  get type(): unknown {
    return this.#data.type;
  }

  get mentionChannels(): object[] | null {
    return this.#data.mention_channels ?? null;
  }

  get reactions(): object[] | null {
    return this.#data.reactions ?? null;
  }

  get nonce(): unknown | null {
    return this.#data.nonce ?? null;
  }

  get webhookId(): unknown | null {
    return this.#data.webhook_id ?? null;
  }

  get activity(): object | null {
    return this.#data.activity ?? null;
  }

  get application(): object | null {
    return this.#data.application ?? null;
  }

  get applicationId(): unknown | null {
    return this.#data.application_id ?? null;
  }

  get flags(): unknown | null {
    return this.#data.flags ?? null;
  }

  get components(): unknown[] | null {
    return this.#data.components ?? null;
  }

  get stickerItems(): object[] | null {
    return this.#data.sticker_items ?? null;
  }

  get stickers(): object[] | null {
    return this.#data.stickers ?? null;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get roleSubscriptionData(): object | null {
    return this.#data.role_subscription_data ?? null;
  }

  get poll(): object | null {
    return this.#data.poll ?? null;
  }

  get call(): object | null {
    return this.#data.call ?? null;
  }

  get messageReference(): unknown | null {
    return this.#data.message_reference ?? null;
  }

  get interactionMetadata(): unknown | null {
    return this.#data.interaction_metadata ?? null;
  }

  get thread(): unknown | null {
    return this.#data.thread ?? null;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get member(): object | null {
    return this.#data.member ?? null;
  }

  get mentions(): unknown[] | null {
    return this.#data.mentions ?? null;
  }

  static fromJson(json: MessageCreateEntity): Message {
    return new Message(json);
  }

  toJson(): MessageCreateEntity {
    return { ...this.#data };
  }

  clone(): Message {
    return new Message(this.toJson());
  }

  validate(): boolean {
    try {
      MessageSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<MessageCreateEntity>): Message {
    return new Message({ ...this.toJson(), ...other });
  }

  equals(other: Message): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const MessageSchema = z.instanceof(Message);
