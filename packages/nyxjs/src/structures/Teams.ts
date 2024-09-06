import type { MembershipState, TeamMemberRoles, TeamMemberStructure, TeamStructure } from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class TeamMember extends Base<TeamMemberStructure> {
    public membershipState!: MembershipState;

    public role!: TeamMemberRoles;

    public teamId!: Snowflake;

    public user!: Pick<User, "avatar" | "discriminator" | "id" | "toJSON" | "username">;

    public constructor(data: Partial<TeamMemberStructure>) {
        super(data);
    }

    protected patch(data: Partial<TeamMemberStructure>): void {
        this.membershipState = data.membership_state ?? this.membershipState;
        this.role = data.role ?? this.role;
        this.teamId = data.team_id ?? this.teamId;
        this.user = data.user ? User.from(data.user) : this.user;
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

    protected patch(data: Partial<TeamStructure>): void {
        this.icon = data.icon ?? this.icon;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.ownerUserId = data.owner_user_id ?? this.ownerUserId;
        this.members = data.members ? data.members.map((member) => TeamMember.from(member)) : this.members;
    }
}

export { MembershipState, type TeamMemberRoles } from "@nyxjs/api-types";
