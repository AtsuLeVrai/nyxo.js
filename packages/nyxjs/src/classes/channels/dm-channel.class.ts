import { ChannelType, type DmChannelEntity, type Snowflake } from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";
import { Channel } from "./channel.class.js";

export class DmChannel
  extends Channel<DmChannelEntity>
  implements EnforceCamelCase<DmChannelEntity>
{
  override get type(): ChannelType.Dm {
    return ChannelType.Dm;
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get recipients(): User[] {
    return this.data.recipients.map((user) => User.from(this.client, user));
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }
}
