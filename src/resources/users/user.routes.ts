import type { Rest } from "../../core/index.js";
import { User } from "./user.class.js";
import type { ApplicationRoleConnectionEntity, UserEntity } from "./user.entity.js";

export interface ModifyCurrentUserData {
  username?: string;
  avatar?: string | null; // TODO: string = DataUri
  banner?: string | null; // TODO: string = DataUri
}

export interface GetCurrentUserGuildsQuery {
  before?: string;
  after?: string;
  limit?: number;
  with_counts?: boolean;
}

export interface CreateDMData {
  recipient_id: string;
}

export interface CreateGroupDMData {
  access_tokens: string[];
  nicks: Record<string, string>;
}

type StripNull<T> = {
  [K in keyof T]: Exclude<T[K], null>;
};

export type UpdateApplicationRoleConnectionData = Partial<
  StripNull<Omit<ApplicationRoleConnectionEntity, "metadata">> &
    Pick<ApplicationRoleConnectionEntity, "metadata">
>;

export class BaseRoutes {
  protected readonly rest: Rest;

  constructor(rest: Rest) {
    this.rest = rest;
  }
}

export class UserRoutes extends BaseRoutes {
  async getCurrentUser<T extends boolean>(options?: {
    wrap: T;
  }): Promise<T extends true ? User : UserEntity> {
    // TODO: Implement the REST API call
    const response = (await Promise.resolve({})) as UserEntity;
    if (options?.wrap) {
      return new User(response) as T extends true ? User : UserEntity;
    }

    return response;
  }
}
