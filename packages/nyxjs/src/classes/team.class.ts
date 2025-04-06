import {
  MembershipState,
  type Snowflake,
  type TeamEntity,
  type TeamMemberEntity,
  TeamMemberRole,
  type UserEntity,
} from "@nyxjs/core";
import { Cdn, type ImageOptions } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a member of a team within Discord.
 * Team members can have different roles and states within a team.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#team-member-object}
 */
export class TeamMember extends BaseClass<TeamMemberEntity> {
  /**
   * The user's membership state on the team
   */
  get membershipState(): MembershipState {
    return this.data.membership_state;
  }

  /**
   * The ID of the team that the user is a member of
   */
  get teamId(): Snowflake {
    return this.data.team_id;
  }

  /**
   * The user object containing information about the team member
   */
  get user(): User {
    return new User(this.client, this.data.user as UserEntity);
  }

  /**
   * The role of the user in the team
   */
  get role(): TeamMemberRole {
    return this.data.role;
  }

  /**
   * Whether the team member has accepted their invitation
   */
  get hasAccepted(): boolean {
    return this.membershipState === MembershipState.Accepted;
  }

  /**
   * Whether the team member is pending invitation acceptance
   */
  get isPending(): boolean {
    return this.membershipState === MembershipState.Invited;
  }

  /**
   * Whether the team member has admin privileges
   */
  get isAdmin(): boolean {
    return this.role === TeamMemberRole.Admin;
  }

  /**
   * Whether the team member has developer privileges
   */
  get isDeveloper(): boolean {
    return this.role === TeamMemberRole.Developer;
  }

  /**
   * Whether the team member has read-only privileges
   */
  get isReadOnly(): boolean {
    return this.role === TeamMemberRole.ReadOnly;
  }
}

/**
 * Represents a team on Discord that can own applications.
 * Teams help multiple users work together on applications and share management rights.
 * Teams can have a maximum of 25 apps.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#team-object}
 */
export class Team extends BaseClass<TeamEntity> {
  /**
   * The team's icon hash
   */
  get icon(): string | null {
    return this.data.icon;
  }

  /**
   * The unique ID of the team
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The members of the team
   */
  get members(): TeamMember[] {
    return this.data.members.map(
      (member) => new TeamMember(this.client, member),
    );
  }

  /**
   * The name of the team
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The user ID of the team owner
   */
  get ownerUserId(): Snowflake {
    return this.data.owner_user_id;
  }

  /**
   * The owner member object of the team
   */
  get owner(): TeamMember | undefined {
    return this.members.find((member) => member.user.id === this.ownerUserId);
  }

  /**
   * The accepted members of the team
   */
  get acceptedMembers(): TeamMember[] {
    return this.members.filter((member) => member.hasAccepted);
  }

  /**
   * The pending members of the team who have been invited but haven't accepted
   */
  get pendingMembers(): TeamMember[] {
    return this.members.filter((member) => member.isPending);
  }

  /**
   * The admin members of the team
   */
  get adminMembers(): TeamMember[] {
    return this.members.filter((member) => member.isAdmin);
  }

  /**
   * The number of members in the team
   */
  get memberCount(): number {
    return this.members.length;
  }

  /**
   * Gets the URL for this team's icon
   *
   * @param options - Options for the icon URL
   * @returns The URL of the team's icon, or null if the team has no icon
   */
  iconUrl(options: Partial<ImageOptions>): string | null {
    if (!this.icon) {
      return null;
    }

    return Cdn.teamIcon(this.id, this.icon, options);
  }
}
