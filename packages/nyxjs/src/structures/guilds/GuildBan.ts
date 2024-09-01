import type { BanStructure } from "@nyxjs/rest";
import { Base } from "../Base";
import { User } from "../Users";

export class Ban extends Base<BanStructure> {
	public reason!: string | null;

	public user!: User;

	public constructor(data: Partial<BanStructure>) {
		super(data);
	}

	public toJSON(): BanStructure {
		return {
			reason: this.reason,
			user: this.user.toJSON(),
		};
	}

	protected patch(data: Partial<BanStructure>): void {
		if (data.reason !== undefined) {
			this.reason = data.reason;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}
