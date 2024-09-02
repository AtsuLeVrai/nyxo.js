import type { Snowflake } from "@nyxjs/core";
import type {
	MembershipState,
	TeamMemberRoles,
	TeamMemberStructure,
	TeamStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";
import type { User } from "./Users";

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
}

export { MembershipState, type TeamMemberRoles } from "@nyxjs/rest";
