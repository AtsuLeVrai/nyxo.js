import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export const EmojiSchema = z
  .object({
    id: SnowflakeSchema.nullable(),
    name: z.string().nullable(),
    roles: z.array(SnowflakeSchema).optional(),
    user: z.lazy(() => UserSchema).optional(),
    require_colons: z.boolean().optional(),
    managed: z.boolean().optional(),
    animated: z.boolean().optional(),
    available: z.boolean().optional(),
  })
  .strict();

export type EmojiEntity = z.infer<typeof EmojiSchema>;
