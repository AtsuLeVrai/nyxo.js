import type { SetNonNullable } from "type-fest";
import type { AnyChannelEntity } from "./channel.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberObject {
  id: string;
  metadata?: Record<string, string> | null;
  flags?: LobbyMemberFlags;
}

export interface LobbyObject {
  id: string;
  application_id: string;
  metadata?: Record<string, string> | null;
  members: LobbyMemberObject[];
  linked_channel?: AnyChannelEntity | null;
}

export interface CreateLobbyJSONParams
  extends Partial<SetNonNullable<Pick<LobbyObject, "metadata" | "members">>> {
  idle_timeout_seconds?: number;
}

export type ModifyLobbyJSONParams = CreateLobbyJSONParams;

export type LobbyMemberJSONParams = SetNonNullable<Pick<LobbyMemberObject, "metadata" | "flags">>;

export interface LinkChannelLobbyJSONParams {
  channel_id?: string;
}

/**
 * Checks if a lobby member can link channels
 * @param member The lobby member to check
 * @returns true if the member can link lobbies
 */
export function canLinkLobby(member: LobbyMemberObject): boolean {
  if (!member.flags) {
    return false;
  }

  return (member.flags & LobbyMemberFlags.CanLinkLobby) === LobbyMemberFlags.CanLinkLobby;
}

/**
 * Checks if a lobby has a linked channel
 * @param lobby The lobby to check
 * @returns true if the lobby has a linked channel
 */
export function hasLinkedChannel(lobby: LobbyObject): boolean {
  return lobby.linked_channel !== null && lobby.linked_channel !== undefined;
}

/**
 * Gets the number of members in a lobby
 * @param lobby The lobby to count
 * @returns number of members
 */
export function getLobbyMemberCount(lobby: LobbyObject): number {
  return lobby.members.length;
}

/**
 * Checks if a user is a member of a lobby
 * @param lobby The lobby to check
 * @param userId The user ID to search for
 * @returns true if the user is a member
 */
export function isLobbyMember(lobby: LobbyObject, userId: string): boolean {
  return lobby.members.some((member) => member.id === userId);
}
