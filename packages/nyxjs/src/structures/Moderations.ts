import {
    type AutoModerationActionMetadataStructure,
    type AutoModerationActionStructure,
    type AutoModerationActionTypes,
    type AutoModerationRuleEventTypes,
    AutoModerationRuleKeywordPresetTypes,
    type AutoModerationRuleStructure,
    type AutoModerationRuleTriggerMetadataStructure,
    type AutoModerationRuleTriggerTypes,
    type Integer,
    type Snowflake,
} from "@nyxjs/core";
import type { AutoModerationActionExecutionEventFields } from "@nyxjs/gateway";
import { Base } from "./Base.js";

export interface AutoModerationActionMetadataSchema {
    readonly channelId: Snowflake | null;
    readonly customMessage: string | null;
    readonly durationSeconds: Integer | null;
}

export class AutoModerationActionMetadata
    extends Base<AutoModerationActionMetadataStructure, AutoModerationActionMetadataSchema>
    implements AutoModerationActionMetadataSchema
{
    #channelId: Snowflake | null = null;
    #customMessage: string | null = null;
    #durationSeconds: Integer | null = null;

    constructor(data: Partial<AutoModerationActionMetadataStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get customMessage(): string | null {
        return this.#customMessage;
    }

    get durationSeconds(): Integer | null {
        return this.#durationSeconds;
    }

    static from(data: Partial<AutoModerationActionMetadataStructure>): AutoModerationActionMetadata {
        return new AutoModerationActionMetadata(data);
    }

    patch(data: Partial<AutoModerationActionMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#customMessage = data.custom_message ?? this.#customMessage;
        this.#durationSeconds = data.duration_seconds ?? this.#durationSeconds;
    }

    toJson(): Partial<AutoModerationActionMetadataStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            custom_message: this.#customMessage ?? undefined,
            duration_seconds: this.#durationSeconds ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AutoModerationActionMetadataSchema {
        return {
            channelId: this.#channelId,
            customMessage: this.#customMessage,
            durationSeconds: this.#durationSeconds,
        };
    }

    clone(): AutoModerationActionMetadata {
        return new AutoModerationActionMetadata(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#customMessage = null;
        this.#durationSeconds = null;
    }

    equals(other: Partial<AutoModerationActionMetadata>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#customMessage === other.customMessage &&
                this.#durationSeconds === other.durationSeconds,
        );
    }
}

export interface AutoModerationActionSchema {
    readonly metadata: AutoModerationActionMetadata | null;
    readonly type: AutoModerationActionTypes | null;
}

export class AutoModerationAction
    extends Base<AutoModerationActionStructure, AutoModerationActionSchema>
    implements AutoModerationActionSchema
{
    #metadata: AutoModerationActionMetadata | null = null;
    #type: AutoModerationActionTypes | null = null;

    constructor(data: Partial<AutoModerationActionStructure>) {
        super();
        this.patch(data);
    }

    get metadata(): AutoModerationActionMetadata | null {
        return this.#metadata;
    }

    get type(): AutoModerationActionTypes | null {
        return this.#type;
    }

    static from(data: Partial<AutoModerationActionStructure>): AutoModerationAction {
        return new AutoModerationAction(data);
    }

    patch(data: Partial<AutoModerationActionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#metadata = data.metadata ? AutoModerationActionMetadata.from(data.metadata) : this.#metadata;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<AutoModerationActionStructure> {
        return {
            metadata: this.#metadata?.toJson() as AutoModerationActionMetadataStructure,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AutoModerationActionSchema {
        return {
            metadata: this.#metadata?.valueOf() as AutoModerationActionMetadata,
            type: this.#type,
        };
    }

    clone(): AutoModerationAction {
        return new AutoModerationAction(this.toJson());
    }

    reset(): void {
        this.#metadata = null;
        this.#type = null;
    }

    equals(other: Partial<AutoModerationAction>): boolean {
        return Boolean(this.#metadata?.equals(other.metadata ?? {}) && this.#type === other.type);
    }
}

export interface AutoModerationRuleTriggerMetadataSchema {
    readonly allowList: string[];
    readonly keywordFilter: string[];
    readonly mentionRaidProtectionEnabled: boolean | null;
    readonly mentionTotalLimit: Integer | null;
    readonly presets: AutoModerationRuleKeywordPresetTypes[];
    readonly regexPatterns: string[];
}

export class AutoModerationRuleTriggerMetadata
    extends Base<AutoModerationRuleTriggerMetadataStructure, AutoModerationRuleTriggerMetadataSchema>
    implements AutoModerationRuleTriggerMetadataSchema
{
    static MAX_ALLOW_LIST_LENGTH = 1000;
    static MAX_KEYWORD_FILTER_LENGTH = 1000;
    static MAX_MENTION_TOTAL_LIMIT = 50;
    static MAX_REGEX_PATTERNS_LENGTH = 10;
    #allowList: string[] = [];
    #keywordFilter: string[] = [];
    #mentionRaidProtectionEnabled = false;
    #mentionTotalLimit: Integer | null = null;
    #presets: AutoModerationRuleKeywordPresetTypes[] = [];
    #regexPatterns: string[] = [];

    constructor(data: Partial<AutoModerationRuleTriggerMetadataStructure>) {
        super();
        this.patch(data);
    }

    get allowList(): string[] {
        return [...this.#allowList];
    }

    get keywordFilter(): string[] {
        return [...this.#keywordFilter];
    }

    get mentionRaidProtectionEnabled(): boolean {
        return this.#mentionRaidProtectionEnabled;
    }

    get mentionTotalLimit(): Integer | null {
        return this.#mentionTotalLimit;
    }

    get presets(): AutoModerationRuleKeywordPresetTypes[] {
        return [...this.#presets];
    }

    get regexPatterns(): string[] {
        return [...this.#regexPatterns];
    }

    static from(data: Partial<AutoModerationRuleTriggerMetadataStructure>): AutoModerationRuleTriggerMetadata {
        return new AutoModerationRuleTriggerMetadata(data);
    }

    patch(data: Partial<AutoModerationRuleTriggerMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.allow_list !== undefined) {
            if (!Array.isArray(data.allow_list)) {
                throw new TypeError(`Expected array for allow_list, got ${typeof data.allow_list}`);
            }
            if (data.allow_list.length > AutoModerationRuleTriggerMetadata.MAX_ALLOW_LIST_LENGTH) {
                throw new RangeError(
                    `Allow list exceeds maximum length of ${AutoModerationRuleTriggerMetadata.MAX_ALLOW_LIST_LENGTH}`,
                );
            }
            if (!data.allow_list.every((item) => typeof item === "string")) {
                throw new TypeError("All items in allow_list must be strings");
            }
            this.#allowList = [...data.allow_list];
        }

        if (data.keyword_filter !== undefined) {
            if (!Array.isArray(data.keyword_filter)) {
                throw new TypeError(`Expected array for keyword_filter, got ${typeof data.keyword_filter}`);
            }
            if (data.keyword_filter.length > AutoModerationRuleTriggerMetadata.MAX_KEYWORD_FILTER_LENGTH) {
                throw new RangeError(
                    `Keyword filter exceeds maximum length of ${AutoModerationRuleTriggerMetadata.MAX_KEYWORD_FILTER_LENGTH}`,
                );
            }
            if (!data.keyword_filter.every((item) => typeof item === "string")) {
                throw new TypeError("All items in keyword_filter must be strings");
            }
            this.#keywordFilter = [...data.keyword_filter];
        }

        if (data.presets !== undefined) {
            if (!Array.isArray(data.presets)) {
                throw new TypeError(`Expected array for presets, got ${typeof data.presets}`);
            }
            if (!data.presets.every((preset) => Object.values(AutoModerationRuleKeywordPresetTypes).includes(preset))) {
                throw new TypeError("Invalid preset type detected");
            }
            this.#presets = [...data.presets];
        }

        if (data.regex_patterns !== undefined) {
            if (!Array.isArray(data.regex_patterns)) {
                throw new TypeError(`Expected array for regex_patterns, got ${typeof data.regex_patterns}`);
            }
            if (data.regex_patterns.length > AutoModerationRuleTriggerMetadata.MAX_REGEX_PATTERNS_LENGTH) {
                throw new RangeError(
                    `Regex patterns exceeds maximum length of ${AutoModerationRuleTriggerMetadata.MAX_REGEX_PATTERNS_LENGTH}`,
                );
            }
            if (!data.regex_patterns.every((item) => typeof item === "string")) {
                throw new TypeError("All items in regex_patterns must be strings");
            }
            for (const pattern of data.regex_patterns) {
                try {
                    new RegExp(pattern);
                } catch (_error) {
                    throw new TypeError(`Invalid regex pattern: ${pattern}`);
                }
            }
            this.#regexPatterns = [...data.regex_patterns];
        }

        this.#mentionRaidProtectionEnabled = Boolean(
            data.mention_raid_protection_enabled ?? this.#mentionRaidProtectionEnabled,
        );

        if (data.mention_total_limit !== undefined) {
            if (typeof data.mention_total_limit !== "number") {
                throw new TypeError(`Expected number for mention_total_limit, got ${typeof data.mention_total_limit}`);
            }
            if (data.mention_total_limit > AutoModerationRuleTriggerMetadata.MAX_MENTION_TOTAL_LIMIT) {
                throw new RangeError(
                    `Mention total limit exceeds maximum of ${AutoModerationRuleTriggerMetadata.MAX_MENTION_TOTAL_LIMIT}`,
                );
            }
            this.#mentionTotalLimit = data.mention_total_limit;
        }
    }

    toJson(): AutoModerationRuleTriggerMetadataStructure {
        return {
            allow_list: [...this.#allowList],
            keyword_filter: [...this.#keywordFilter],
            mention_raid_protection_enabled: this.#mentionRaidProtectionEnabled ?? undefined,
            mention_total_limit: this.#mentionTotalLimit ?? undefined,
            presets: [...this.#presets],
            regex_patterns: [...this.#regexPatterns],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AutoModerationRuleTriggerMetadataSchema {
        return {
            allowList: [...this.#allowList],
            keywordFilter: [...this.#keywordFilter],
            mentionRaidProtectionEnabled: this.#mentionRaidProtectionEnabled,
            mentionTotalLimit: this.#mentionTotalLimit,
            presets: [...this.#presets],
            regexPatterns: [...this.#regexPatterns],
        };
    }

    clone(): AutoModerationRuleTriggerMetadata {
        return new AutoModerationRuleTriggerMetadata(this.toJson());
    }

    reset(): void {
        this.#allowList = [];
        this.#keywordFilter = [];
        this.#mentionRaidProtectionEnabled = false;
        this.#mentionTotalLimit = null;
        this.#presets = [];
        this.#regexPatterns = [];
    }

    equals(other: Partial<AutoModerationRuleTriggerMetadata>): boolean {
        return Boolean(
            this.#mentionRaidProtectionEnabled === other.mentionRaidProtectionEnabled &&
                this.#mentionTotalLimit === other.mentionTotalLimit &&
                JSON.stringify(this.#allowList) === JSON.stringify(other.allowList) &&
                JSON.stringify(this.#keywordFilter) === JSON.stringify(other.keywordFilter) &&
                JSON.stringify(this.#presets) === JSON.stringify(other.presets) &&
                JSON.stringify(this.#regexPatterns) === JSON.stringify(other.regexPatterns),
        );
    }
}

export interface AutoModerationRuleSchema {
    readonly actions: AutoModerationAction[];
    readonly creatorId: Snowflake | null;
    readonly enabled: boolean;
    readonly eventType: AutoModerationRuleEventTypes | null;
    readonly exemptChannels: Snowflake[];
    readonly exemptRoles: Snowflake[];
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly triggerMetadata: AutoModerationRuleTriggerMetadata | null;
    readonly triggerType: AutoModerationRuleTriggerTypes | null;
}

export class AutoModerationRule
    extends Base<AutoModerationRuleStructure, AutoModerationRuleSchema>
    implements AutoModerationRuleSchema
{
    #actions: AutoModerationAction[] = [];
    #creatorId: Snowflake | null = null;
    #enabled = false;
    #eventType: AutoModerationRuleEventTypes | null = null;
    #exemptChannels: Snowflake[] = [];
    #exemptRoles: Snowflake[] = [];
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #triggerMetadata: AutoModerationRuleTriggerMetadata | null = null;
    #triggerType: AutoModerationRuleTriggerTypes | null = null;

    constructor(data: Partial<AutoModerationRuleStructure>) {
        super();
        this.patch(data);
    }

    get actions(): AutoModerationAction[] {
        return [...this.#actions];
    }

    get creatorId(): Snowflake | null {
        return this.#creatorId;
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    get eventType(): AutoModerationRuleEventTypes | null {
        return this.#eventType;
    }

    get exemptChannels(): Snowflake[] {
        return [...this.#exemptChannels];
    }

    get exemptRoles(): Snowflake[] {
        return [...this.#exemptRoles];
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get triggerMetadata(): AutoModerationRuleTriggerMetadata | null {
        return this.#triggerMetadata ?? null;
    }

    get triggerType(): AutoModerationRuleTriggerTypes | null {
        return this.#triggerType;
    }

    static from(data: Partial<AutoModerationRuleStructure>): AutoModerationRule {
        return new AutoModerationRule(data);
    }

    patch(data: Partial<AutoModerationRuleStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.actions !== undefined) {
            if (!Array.isArray(data.actions)) {
                throw new TypeError(`Expected array for actions, got ${typeof data.actions}`);
            }
            this.#actions = data.actions.map((action) => AutoModerationAction.from(action));
        }

        this.#creatorId = data.creator_id ?? this.#creatorId;
        this.#enabled = Boolean(data.enabled ?? this.#enabled);
        this.#eventType = data.event_type ?? this.#eventType;
        this.#exemptChannels = Array.isArray(data.exempt_channels) ? [...data.exempt_channels] : this.#exemptChannels;
        this.#exemptRoles = Array.isArray(data.exempt_roles) ? [...data.exempt_roles] : this.#exemptRoles;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#triggerMetadata = data.trigger_metadata
            ? AutoModerationRuleTriggerMetadata.from(data.trigger_metadata)
            : this.#triggerMetadata;
        this.#triggerType = data.trigger_type ?? this.#triggerType;
    }

    toJson(): Partial<AutoModerationRuleStructure> {
        return {
            actions: this.#actions?.map((action) => action.toJson()) as AutoModerationActionStructure[],
            creator_id: this.#creatorId ?? undefined,
            enabled: this.#enabled ?? undefined,
            event_type: this.#eventType ?? undefined,
            exempt_channels: this.#exemptChannels ?? undefined,
            exempt_roles: this.#exemptRoles ?? undefined,
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            trigger_metadata: this.#triggerMetadata?.toJson() ?? undefined,
            trigger_type: this.#triggerType ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AutoModerationRuleSchema {
        return {
            actions: this.#actions,
            creatorId: this.#creatorId,
            enabled: this.#enabled,
            eventType: this.#eventType,
            exemptChannels: this.#exemptChannels,
            exemptRoles: this.#exemptRoles,
            guildId: this.#guildId,
            id: this.#id,
            name: this.#name,
            triggerMetadata: this.#triggerMetadata,
            triggerType: this.#triggerType,
        };
    }

    clone(): AutoModerationRule {
        return new AutoModerationRule(this.toJson());
    }

    reset(): void {
        this.#actions = [];
        this.#creatorId = null;
        this.#enabled = false;
        this.#eventType = null;
        this.#exemptChannels = [];
        this.#exemptRoles = [];
        this.#guildId = null;
        this.#id = null;
        this.#name = null;
        this.#triggerMetadata = null;
        this.#triggerType = null;
    }

    equals(other: Partial<AutoModerationRule>): boolean {
        return Boolean(
            JSON.stringify(this.#actions?.map((action) => action.toJson())) ===
                JSON.stringify(other.actions?.map((action) => action.toJson())) &&
                this.#creatorId === other.creatorId &&
                this.#enabled === other.enabled &&
                this.#eventType === other.eventType &&
                JSON.stringify(this.#exemptChannels) === JSON.stringify(other.exemptChannels) &&
                JSON.stringify(this.#exemptRoles) === JSON.stringify(other.exemptRoles) &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#name === other.name &&
                (this.#triggerMetadata?.equals(other.triggerMetadata ?? {}) ?? other.triggerMetadata === null) &&
                this.#triggerType === other.triggerType,
        );
    }
}

export interface AutoModerationActionExecutionEventSchema {
    readonly action: AutoModerationAction | null;
    readonly alertSystemMessageId: Snowflake | null;
    readonly channelId: Snowflake | null;
    readonly content: string | null;
    readonly guildId: Snowflake | null;
    readonly matchedContent: string | null;
    readonly matchedKeyword: string | null;
    readonly messageId: Snowflake | null;
    readonly ruleId: Snowflake | null;
    readonly ruleTriggerType: AutoModerationRuleTriggerTypes | null;
    readonly userId: Snowflake | null;
}

export class AutoModerationActionExecution
    extends Base<AutoModerationActionExecutionEventFields, AutoModerationActionExecutionEventSchema>
    implements AutoModerationActionExecutionEventSchema
{
    #action: AutoModerationAction | null = null;
    #alertSystemMessageId: Snowflake | null = null;
    #channelId: Snowflake | null = null;
    #content: string | null = null;
    #guildId: Snowflake | null = null;
    #matchedContent: string | null = null;
    #matchedKeyword: string | null = null;
    #messageId: Snowflake | null = null;
    #ruleId: Snowflake | null = null;
    #ruleTriggerType: AutoModerationRuleTriggerTypes | null = null;
    #userId: Snowflake | null = null;

    constructor(data: Partial<AutoModerationActionExecutionEventFields>) {
        super();
        this.patch(data);
    }

    get action(): AutoModerationAction | null {
        return this.#action;
    }

    get alertSystemMessageId(): Snowflake | null {
        return this.#alertSystemMessageId;
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get content(): string | null {
        return this.#content;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get matchedContent(): string | null {
        return this.#matchedContent;
    }

    get matchedKeyword(): string | null {
        return this.#matchedKeyword;
    }

    get messageId(): Snowflake | null {
        return this.#messageId;
    }

    get ruleId(): Snowflake | null {
        return this.#ruleId;
    }

    get ruleTriggerType(): AutoModerationRuleTriggerTypes | null {
        return this.#ruleTriggerType;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    static from(data: Partial<AutoModerationActionExecutionEventFields>): AutoModerationActionExecution {
        return new AutoModerationActionExecution(data);
    }

    patch(data: Partial<AutoModerationActionExecutionEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#action = data.action ? AutoModerationAction.from(data.action) : this.#action;
        this.#alertSystemMessageId = data.alert_system_message_id ?? this.#alertSystemMessageId;
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#content = data.content ?? this.#content;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#matchedContent = data.matched_content ?? this.#matchedContent;
        this.#matchedKeyword = data.matched_keyword ?? this.#matchedKeyword;
        this.#messageId = data.message_id ?? this.#messageId;
        this.#ruleId = data.rule_id ?? this.#ruleId;
        this.#ruleTriggerType = data.rule_trigger_type ?? this.#ruleTriggerType;
        this.#userId = data.user_id ?? this.#userId;
    }

    toJson(): Partial<AutoModerationActionExecutionEventFields> {
        return {
            action: this.#action?.toJson() as AutoModerationActionStructure,
            alert_system_message_id: this.#alertSystemMessageId ?? undefined,
            channel_id: this.#channelId ?? undefined,
            content: this.#content ?? undefined,
            guild_id: this.#guildId ?? undefined,
            matched_content: this.#matchedContent ?? undefined,
            matched_keyword: this.#matchedKeyword ?? undefined,
            message_id: this.#messageId ?? undefined,
            rule_id: this.#ruleId ?? undefined,
            rule_trigger_type: this.#ruleTriggerType ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AutoModerationActionExecutionEventSchema {
        return {
            action: this.#action,
            alertSystemMessageId: this.#alertSystemMessageId,
            channelId: this.#channelId,
            content: this.#content,
            guildId: this.#guildId,
            matchedContent: this.#matchedContent,
            matchedKeyword: this.#matchedKeyword,
            messageId: this.#messageId,
            ruleId: this.#ruleId,
            ruleTriggerType: this.#ruleTriggerType,
            userId: this.#userId,
        };
    }

    clone(): AutoModerationActionExecution {
        return new AutoModerationActionExecution(this.toJson());
    }

    reset(): void {
        this.#action = null;
        this.#alertSystemMessageId = null;
        this.#channelId = null;
        this.#content = null;
        this.#guildId = null;
        this.#matchedContent = null;
        this.#matchedKeyword = null;
        this.#messageId = null;
        this.#ruleId = null;
        this.#ruleTriggerType = null;
        this.#userId = null;
    }

    equals(other: Partial<AutoModerationActionExecution>): boolean {
        return Boolean(
            (this.#action?.equals(other.action ?? {}) ?? other.action === null) &&
                this.#alertSystemMessageId === other.alertSystemMessageId &&
                this.#channelId === other.channelId &&
                this.#content === other.content &&
                this.#guildId === other.guildId &&
                this.#matchedContent === other.matchedContent &&
                this.#matchedKeyword === other.matchedKeyword &&
                this.#messageId === other.messageId &&
                this.#ruleId === other.ruleId &&
                this.#ruleTriggerType === other.ruleTriggerType &&
                this.#userId === other.userId,
        );
    }
}
