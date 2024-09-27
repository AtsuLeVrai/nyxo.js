import type { MembershipState, Snowflake, TeamMemberStructure, TeamStructure } from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class TeamMember extends Base<TeamMemberStructure> {
    public membershipState: MembershipState;

    public role: string;

    public teamId: Snowflake;

    public user: Pick<User, "avatar" | "discriminator" | "id" | "username">;

    public constructor(data: Partial<TeamMemberStructure> = {}) {
        super();
        this.membershipState = data.membership_state!;
        this.role = data.role!;
        this.teamId = data.team_id!;
        this.user = new User(data.user!);
    }
}

export class Team extends Base<TeamStructure> {
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
}
