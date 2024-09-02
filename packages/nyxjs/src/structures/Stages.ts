import type { Snowflake } from "@nyxjs/core";
import type { StageInstanceStructure, StagePrivacyLevels } from "@nyxjs/rest";
import { Base } from "./Base";

export class StageInstance extends Base<StageInstanceStructure> {
	public channelId!: Snowflake;

	public discoverableDisabled!: boolean;

	public guildId!: Snowflake;

	public guildScheduledEventId!: Snowflake | null;

	public id!: Snowflake;

	public privacyLevel!: StagePrivacyLevels;

	public topic!: string;

	public constructor(data: Partial<StageInstanceStructure>) {
		super(data);
	}
}

export { type StagePrivacyLevels } from "@nyxjs/rest";
