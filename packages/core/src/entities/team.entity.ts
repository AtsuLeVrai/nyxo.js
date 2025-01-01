import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export const MembershipState = {
  invited: 1,
  accepted: 2,
} as const;

export type MembershipState =
  (typeof MembershipState)[keyof typeof MembershipState];

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export const TeamMemberSchema = z
  .object({
    membership_state: z.nativeEnum(MembershipState),
    team_id: SnowflakeSchema,
    user: UserSchema.partial(),
    role: z.union([
      z.literal("admin"),
      z.literal("developer"),
      z.literal("read_only"),
    ]),
  })
  .strict();

export type TeamMemberEntity = z.infer<typeof TeamMemberSchema>;

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export const TeamSchema = z
  .object({
    icon: z.string().nullable(),
    id: SnowflakeSchema,
    members: z.array(TeamMemberSchema),
    name: z.string(),
    owner_user_id: SnowflakeSchema,
  })
  .strict();

export type TeamEntity = z.infer<typeof TeamSchema>;
