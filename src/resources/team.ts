import type { UserObject } from "./user.js";

export enum MembershipState {
  Invited = 1,
  Accepted = 2,
}

export enum TeamMemberRole {
  Admin = "admin",
  Developer = "developer",
  ReadOnly = "read_only",
}

export interface TeamMemberObject {
  membership_state: MembershipState;
  team_id: string;
  user: Pick<UserObject, "id" | "username" | "discriminator" | "avatar">;
  role: TeamMemberRole;
}

export interface TeamObject {
  icon: string | null;
  id: string;
  members: TeamMemberObject[];
  name: string;
  owner_user_id: string;
}

/**
 * Checks if a team member has admin privileges (Admin or Owner)
 * @param teamMember The team member to check
 * @param team The team object to check ownership
 * @returns true if the member is an admin or owner
 */
export function hasAdminPrivileges(teamMember: TeamMemberObject, team: TeamObject): boolean {
  return teamMember.role === TeamMemberRole.Admin || teamMember.user.id === team.owner_user_id;
}

/**
 * Checks if a team member is the team owner
 * @param teamMember The team member to check
 * @param team The team object to check ownership
 * @returns true if the member is the team owner
 */
export function isTeamOwner(teamMember: TeamMemberObject, team: TeamObject): boolean {
  return teamMember.user.id === team.owner_user_id;
}

/**
 * Checks if a team member has accepted their invitation
 * @param teamMember The team member to check
 * @returns true if the member has accepted their invitation
 */
export function hasAcceptedInvitation(teamMember: TeamMemberObject): boolean {
  return teamMember.membership_state === MembershipState.Accepted;
}

/**
 * Gets the team member with developer privileges or higher
 * @param team The team to check
 * @returns array of team members with developer, admin, or owner privileges
 */
export function getDeveloperMembers(team: TeamObject): TeamMemberObject[] {
  return team.members.filter(
    (member) =>
      member.role === TeamMemberRole.Developer ||
      member.role === TeamMemberRole.Admin ||
      member.user.id === team.owner_user_id,
  );
}

/**
 * Gets all active (accepted) team members
 * @param team The team to check
 * @returns array of team members who have accepted their invitation
 */
export function getActiveMembers(team: TeamObject): TeamMemberObject[] {
  return team.members.filter((member) => member.membership_state === MembershipState.Accepted);
}
