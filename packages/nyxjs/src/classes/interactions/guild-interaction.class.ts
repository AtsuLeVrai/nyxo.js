import type {
  GuildInteractionEntity,
  GuildMemberEntity,
  Locale,
  Snowflake,
} from "@nyxjs/core";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { GuildMember } from "../guilds/index.js";
import { Interaction } from "./interaction.class.js";

export class GuildInteraction<
    T extends GuildInteractionEntity = GuildInteractionEntity,
  >
  extends Interaction<T>
  implements EnforceCamelCase<GuildInteractionEntity>
{
  override get guildId(): Snowflake {
    return this.data.guild_id;
  }

  override get member(): GuildMember {
    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  get guildLocale(): Locale | undefined {
    return this.data.guild_locale;
  }
}
