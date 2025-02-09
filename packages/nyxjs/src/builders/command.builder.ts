import {
  type ApplicationCommandEntryPointType,
  ApplicationCommandType,
  type ApplicationIntegrationType,
  type AvailableLocale,
  type BaseApplicationCommandEntity,
  ChatInputApplicationCommandEntity,
  EntryPointApplicationCommandEntity,
  type InteractionContextType,
  MessageApplicationCommandEntity,
  UserApplicationCommandEntity,
} from "@nyxjs/core";
import { z } from "zod";
import type { BaseCommandOptionBuilder } from "./command-options.builder.js";

export abstract class BaseCommandBuilder<
  T extends z.input<typeof BaseApplicationCommandEntity> = z.infer<
    typeof BaseApplicationCommandEntity
  >,
> {
  protected data: Partial<T>;

  protected constructor(data: Partial<T> = {}) {
    this.data = {
      ...data,
    };
  }

  setName(name: string): this {
    this.data.name = name;
    return this;
  }

  setNameLocalizations(localizations: z.input<typeof AvailableLocale>): this {
    this.data.name_localizations = localizations;
    return this;
  }

  setDefaultMemberPermissions(permissions: string | null): this {
    this.data.default_member_permissions = permissions;
    return this;
  }

  setDmPermission(allowed = true): this {
    this.data.dm_permission = allowed;
    return this;
  }

  setNsfw(nsfw = true): this {
    this.data.nsfw = nsfw;
    return this;
  }

  setIntegrationTypes(types: ApplicationIntegrationType[]): this {
    this.data.integration_types = types;
    return this;
  }

  setContexts(contexts: InteractionContextType[]): this {
    this.data.contexts = contexts;
    return this;
  }

  abstract toJson(): T;
}

export class ChatInputCommandBuilder extends BaseCommandBuilder<
  z.input<typeof ChatInputApplicationCommandEntity>
> {
  constructor(
    data: Partial<z.input<typeof ChatInputApplicationCommandEntity>> = {},
  ) {
    super({
      type: ApplicationCommandType.ChatInput,
      ...data,
    });
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setDescriptionLocalizations(
    localizations: z.input<typeof AvailableLocale>,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  addOption(option: BaseCommandOptionBuilder): this {
    this.data.options = [
      ...(this.data.options || []),
      option.toJson(),
    ] as z.input<typeof ChatInputApplicationCommandEntity>["options"];
    return this;
  }

  addOptions(...options: BaseCommandOptionBuilder[]): this {
    this.data.options = [
      ...(this.data.options || []),
      ...options.map((o) => o.toJson()),
    ] as z.input<typeof ChatInputApplicationCommandEntity>["options"];
    return this;
  }

  toJson(): ChatInputApplicationCommandEntity {
    return ChatInputApplicationCommandEntity.parse(this.data);
  }
}

export const ChatInputCommandBuilderSchema = z.instanceof(
  ChatInputCommandBuilder,
);

export class UserCommandBuilder extends BaseCommandBuilder<
  z.input<typeof UserApplicationCommandEntity>
> {
  constructor(
    data: Partial<z.input<typeof UserApplicationCommandEntity>> = {},
  ) {
    super({
      type: ApplicationCommandType.User,
      ...data,
    });
  }

  toJson(): UserApplicationCommandEntity {
    return UserApplicationCommandEntity.parse(this.data);
  }
}

export const UserCommandBuilderSchema = z.instanceof(UserCommandBuilder);

export class MessageCommandBuilder extends BaseCommandBuilder<
  z.input<typeof MessageApplicationCommandEntity>
> {
  constructor(
    data: Partial<z.input<typeof MessageApplicationCommandEntity>> = {},
  ) {
    super({
      type: ApplicationCommandType.Message,
      ...data,
    });
  }

  toJson(): MessageApplicationCommandEntity {
    return MessageApplicationCommandEntity.parse(this.data);
  }
}

export const MessageCommandBuilderSchema = z.instanceof(MessageCommandBuilder);

export class EntryPointCommandBuilder extends BaseCommandBuilder<
  z.input<typeof EntryPointApplicationCommandEntity>
> {
  constructor(
    data: Partial<z.input<typeof EntryPointApplicationCommandEntity>> = {},
  ) {
    super({
      type: ApplicationCommandType.PrimaryEntryPoint,
      ...data,
    });
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setDescriptionLocalizations(
    localizations: z.input<typeof AvailableLocale>,
  ): this {
    this.data.description_localizations = localizations;
    return this;
  }

  setHandler(handler: ApplicationCommandEntryPointType): this {
    this.data.handler = handler;
    return this;
  }

  toJson(): EntryPointApplicationCommandEntity {
    return EntryPointApplicationCommandEntity.parse(this.data);
  }
}

export const EntryPointCommandBuilderSchema = z.instanceof(
  EntryPointCommandBuilder,
);
