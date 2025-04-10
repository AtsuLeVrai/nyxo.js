import {
  ChannelType,
  type GroupDmChannelEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";
import { Channel } from "./channel.class.js";

export class GroupDmChannel
  extends Channel<GroupDmChannelEntity>
  implements EnforceCamelCase<GroupDmChannelEntity>
{
  override get type(): ChannelType.GroupDm {
    return ChannelType.GroupDm;
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  get recipients(): User[] {
    return this.data.recipients.map((user) => User.from(this.client, user));
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }
}
