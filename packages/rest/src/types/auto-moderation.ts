import type { AutoModerationRuleEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleOptionsEntity = Pick<
  AutoModerationRuleEntity,
  | "name"
  | "event_type"
  | "trigger_type"
  | "trigger_metadata"
  | "actions"
  | "enabled"
  | "exempt_roles"
  | "exempt_channels"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleOptionsEntity = Partial<
  Pick<
    AutoModerationRuleEntity,
    | "name"
    | "event_type"
    | "trigger_metadata"
    | "actions"
    | "enabled"
    | "exempt_roles"
    | "exempt_channels"
  >
>;
