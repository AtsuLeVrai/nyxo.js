import type { Snowflake } from "@nyxjs/core";
import type {
	MembershipState,
	TeamMemberRoles,
	TeamMemberStructure,
	TeamStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";
import { User } from "./Users";

export class TeamMember extends Base<TeamMemberStructure> {
	public membershipState!: MembershipState;

	public role!: TeamMemberRoles;

	public teamId!: Snowflake;

	public user!: Pick<
		User,
		"avatar" | "discriminator" | "id" | "toJSON" | "username"
	>;

	public constructor(data: Partial<TeamMemberStructure>) {
		super(data);
	}

	public toJSON(): TeamMemberStructure {
		return {
			membership_state: this.membershipState,
			role: this.role,
			team_id: this.teamId,
			user: this.user,
		};
	}

	protected patch(data: Partial<TeamMemberStructure>): void {
		if (data.membership_state !== undefined) {
			this.membershipState = data.membership_state;
		}

		if (data.role !== undefined) {
			this.role = data.role;
		}

		if (data.team_id !== undefined) {
			this.teamId = data.team_id;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

export class Team extends Base<TeamStructure> {
	public icon!: string | null;

	public id!: Snowflake;

	public members!: TeamMember[];

	public name!: string;

	public ownerUserId!: Snowflake;

	public constructor(data: Partial<TeamStructure>) {
		super(data);
	}

	public toJSON(): TeamStructure {
		return {
			icon: this.icon,
			id: this.id,
			members: this.members.map((member) => member.toJSON()),
			name: this.name,
			owner_user_id: this.ownerUserId,
		};
	}

	protected patch(data: Partial<TeamStructure>): void {
		if (data.icon !== undefined) {
			this.icon = data.icon;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.members !== undefined) {
			this.members = data.members.map((member) => TeamMember.from(member));
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.owner_user_id !== undefined) {
			this.ownerUserId = data.owner_user_id;
		}
	}
}

export { MembershipState, type TeamMemberRoles } from "@nyxjs/rest";
