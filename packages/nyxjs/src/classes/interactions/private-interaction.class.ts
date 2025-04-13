import type {
  BotDmInteractionEntity,
  PrivateChannelInteractionEntity,
} from "@nyxjs/core";
import { User } from "../users/index.js";
import { Interaction } from "./interaction.class.js";

// TODO: Add EnforceCamelCase implementation
export class PrivateInteraction<
  T extends BotDmInteractionEntity | PrivateChannelInteractionEntity =
    | BotDmInteractionEntity
    | PrivateChannelInteractionEntity,
> extends Interaction<T> {
  override get user(): User {
    return new User(this.client, this.data.user);
  }
}
