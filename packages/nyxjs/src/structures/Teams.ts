import type { MembershipState, Snowflake, TeamMemberStructure, TeamStructure } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";
import { User } from "./Users";

export class TeamMember extends BaseStructure<TeamMemberStructure> {
    public membershipState: MembershipState;

    public role: string;

    public teamId: Snowflake;

    public user: Pick<User, "avatar" | "discriminator" | "id" | "toJSON" | "username">;

    public constructor(data: Partial<TeamMemberStructure> = {}) {
        super();
        this.membershipState = data.membership_state!;
        this.role = data.role!;
        this.teamId = data.team_id!;
        this.user = new User(data.user!);
    }

    public toJSON(): TeamMemberStructure {
        return {
            membership_state: this.membershipState,
            role: this.role,
            team_id: this.teamId,
            user: this.user.toJSON(),
        };
    }
}

export class Team extends BaseStructure<TeamStructure> {
    public icon: string | null;

    public id: Snowflake;

    public members: TeamMember[];

    public name: string;

    public ownerUserId: Snowflake;

    public constructor(data: Partial<TeamStructure> = {}) {
        super();
        this.icon = data.icon!;
        this.id = data.id!;
        this.members = data.members!.map((member) => TeamMember.from(member));
        this.name = data.name!;
        this.ownerUserId = data.owner_user_id!;
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
}
