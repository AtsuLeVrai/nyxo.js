import type { MembershipState, Snowflake, TeamMemberStructure, TeamStructure } from "@nyxjs/core";
import { User } from "./Users";

export class TeamMember {
    membershipState!: MembershipState;

    role!: string;

    teamId!: Snowflake;

    user!: Pick<User, "avatar" | "discriminator" | "id" | "username">;

    constructor(data: Partial<TeamMemberStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<TeamMemberStructure>): void {
        if (data.membership_state) {
            this.membershipState = data.membership_state;
        }
        if (data.role) {
            this.role = data.role;
        }
        if (data.team_id) {
            this.teamId = data.team_id;
        }
        if (data.user) {
            this.user = new User(data.user);
        }
    }
}

export class Team {
    icon!: string | null;

    id!: Snowflake;

    members!: TeamMember[];

    name!: string;

    ownerUserId!: Snowflake;

    constructor(data: Partial<TeamStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<TeamStructure>): void {
        if (data.icon) {
            this.icon = data.icon;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.members) {
            this.members = data.members.map((member) => new TeamMember(member));
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.owner_user_id) {
            this.ownerUserId = data.owner_user_id;
        }
    }
}
