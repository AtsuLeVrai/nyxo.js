import type { Snowflake } from "@nyxjs/core";
import type { EmojiStructure } from "@nyxjs/rest";
import { Base } from "./Base";
import type { User } from "./Users";

export class Emoji extends Base<EmojiStructure> {
	public animated?: boolean;

	public available?: boolean;

	public id!: Snowflake | null;

	public managed?: boolean;

	public name!: string | null;

	public requireColons?: boolean;

	public roles?: Snowflake[];

	public user?: User;

	public constructor(data: Partial<EmojiStructure>) {
		super(data);
	}
}
