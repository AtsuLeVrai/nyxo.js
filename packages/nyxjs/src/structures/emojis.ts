import type { Snowflake } from "@nyxjs/core";
import type { EmojiStructure } from "@nyxjs/rest";
import { Base } from "./base";
import { User } from "./users";

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

	public toJSON(): EmojiStructure {
		return {
			animated: this.animated,
			available: this.available,
			id: this.id,
			managed: this.managed,
			name: this.name,
			require_colons: this.requireColons,
			roles: this.roles,
			user: this.user?.toJSON(),
		};
	}

	protected patch(data: Partial<EmojiStructure>): void {
		if (data.animated !== undefined) {
			this.animated = data.animated;
		}

		if (data.available !== undefined) {
			this.available = data.available;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.managed !== undefined) {
			this.managed = data.managed;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.require_colons !== undefined) {
			this.requireColons = data.require_colons;
		}

		if (data.roles !== undefined) {
			this.roles = data.roles;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}
