import type {
  BotDmInteractionEntity,
  PrivateChannelInteractionEntity,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";
import { Interaction } from "./interaction.class.js";

export class PrivateInteraction<
    T extends BotDmInteractionEntity | PrivateChannelInteractionEntity =
      | BotDmInteractionEntity
      | PrivateChannelInteractionEntity,
  >
  extends Interaction<T>
  implements
    EnforceCamelCase<BotDmInteractionEntity | PrivateChannelInteractionEntity>
{
  override get user(): User {
    return User.from(this.client, this.data.user);
  }
}
