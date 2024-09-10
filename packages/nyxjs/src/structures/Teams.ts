import type { MembershipState, Snowflake, TeamMemberRoles, TeamMemberStructure, TeamStructure } from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Base } from "./Base";
import { User } from "./Users";

export class TeamMember extends Base<TeamMemberStructure> {
    public membershipState!: MembershipState;

    public role!: TeamMemberRoles;

    public teamId!: Snowflake;

    public user!: PickWithPublicMethods<User, "avatar" | "discriminator" | "id" | "username">;

    public constructor(data: Readonly<Partial<TeamMemberStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<TeamMemberStructure>>): void {
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

    public constructor(data: Readonly<Partial<TeamStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<TeamStructure>>): void {
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

export { MembershipState, type TeamMemberRoles } from "@nyxjs/core";
