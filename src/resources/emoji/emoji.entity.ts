import type { UserEntity } from "../user/index.js";

export interface EmojiEntity {
  id: string | null;
  name: string | null;
  roles?: string[];
  user?: UserEntity;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}
