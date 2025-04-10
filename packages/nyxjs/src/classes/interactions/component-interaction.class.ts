import {
  type AnyChannelEntity,
  type AnyInteractionEntity,
  ComponentType,
  type InteractionCallbackMessagesEntity,
  InteractionCallbackType,
  type MessageComponentInteractionDataEntity,
  type RoleEntity,
  type SelectMenuOptionEntity,
  type Snowflake,
  type UserEntity,
} from "@nyxjs/core";
import type { MessageCreateEntity } from "@nyxjs/gateway";
import type { EnforceCamelCase } from "../../types/index.js";
import { Message } from "../messages/index.js";
import { User } from "../users/index.js";
import { Interaction } from "./interaction.class.js";

export class ComponentInteraction<
    T extends AnyInteractionEntity & {
      data: MessageComponentInteractionDataEntity;
    } = AnyInteractionEntity & {
      data: MessageComponentInteractionDataEntity;
    },
  >
  extends Interaction<T>
  implements
    EnforceCamelCase<
      AnyInteractionEntity & {
        data: MessageComponentInteractionDataEntity;
      }
    >
{
  get componentData(): MessageComponentInteractionDataEntity {
    return this.interactionData as MessageComponentInteractionDataEntity;
  }

  get customId(): string {
    return this.componentData.custom_id;
  }

  get componentType(): ComponentType {
    return this.componentData.component_type;
  }

  get message(): Message {
    return Message.from(this.client, this.data.message as MessageCreateEntity);
  }

  get values(): SelectMenuOptionEntity[] {
    return this.componentData.values || [];
  }

  isButton(): boolean {
    return this.componentType === ComponentType.Button;
  }

  isSelectMenu(): boolean {
    const type = this.componentType;
    return (
      type === ComponentType.StringSelect ||
      type === ComponentType.UserSelect ||
      type === ComponentType.RoleSelect ||
      type === ComponentType.MentionableSelect ||
      type === ComponentType.ChannelSelect
    );
  }

  getResolvedUsers(): Record<Snowflake, User> | undefined {
    if (!this.componentData.resolved?.users) {
      return undefined;
    }

    const users: Record<Snowflake, User> = {};
    for (const [id, userData] of Object.entries(
      this.componentData.resolved.users,
    )) {
      users[id] = User.from(this.client, userData as UserEntity);
    }
    return users;
  }

  getResolvedRoles(): Record<Snowflake, RoleEntity> | undefined {
    return this.componentData.resolved?.roles;
  }

  getResolvedChannels():
    | Record<Snowflake, Partial<AnyChannelEntity>>
    | undefined {
    return this.componentData.resolved?.channels;
  }

  async deferUpdate(): Promise<void> {
    await this.createResponse({
      type: InteractionCallbackType.DeferredUpdateMessage,
    });
  }

  async updateMessage(
    options: string | Partial<InteractionCallbackMessagesEntity>,
  ): Promise<void> {
    const messageData: InteractionCallbackMessagesEntity =
      typeof options === "string" ? { content: options } : options;

    await this.createResponse({
      type: InteractionCallbackType.UpdateMessage,
      data: messageData,
    });
  }
}
