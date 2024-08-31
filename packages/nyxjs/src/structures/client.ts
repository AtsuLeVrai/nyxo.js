import { EventEmitter } from "node:events";
import type { ApiVersions, GatewayIntents, Integer } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import { Rest } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import { Gateway } from "@nyxjs/ws";

export const ClientEvents = {
	applicationCommandPermissionsUpdate: [],
	autoModerationActionExecution: [],
	autoModerationRuleCreate: [],
	autoModerationRuleDelete: [],
	autoModerationRuleUpdate: [],
	autoModerationBlockMessage: [],
	autoModerationFlagToChannel: [],
	autoModerationUserCommunicationDisabled: [],
	debug: [],
	error: [],
	hello: [],
	invalidateSession: [],
	ready: [],
	reconnect: [],
	resumed: [],
	warn: [],
	channelCreate: [],
	channelDelete: [],
	channelUpdate: [],
	channelPinsUpdate: [],
	channelOverwriteCreate: [],
	channelOverwriteDelete: [],
	channelOverwriteUpdate: [],
	threadCreate: [],
	threadDelete: [],
	threadUpdate: [],
	threadListSync: [],
	threadMemberUpdate: [],
	threadMembersUpdate: [],
	entitlementCreate: [],
	entitlementDelete: [],
	entitlementUpdate: [],
	guildCreate: [],
	guildDelete: [],
	guildUpdate: [],
	guildAuditLogEntryCreate: [],
	guildBanAdd: [],
	guildBanRemove: [],
	guildEmojisUpdate: [],
	guildEmojiCreate: [],
	guildEmojiDelete: [],
	guildEmojiUpdate: [],
	guildStickersUpdate: [],
	guildStickerCreate: [],
	guildStickerDelete: [],
	guildStickerUpdate: [],
	guildIntegrationsUpdate: [],
	guildMemberAdd: [],
	guildMemberRemove: [],
	guildMemberUpdate: [],
	guildMembersChunk: [],
	guildMemberKick: [],
	guildMemberPrune: [],
	guildMemberMove: [],
	guildMemberDisconnect: [],
	guildBotAdd: [],
	guildRoleCreate: [],
	guildRoleDelete: [],
	guildRoleUpdate: [],
	guildScheduledEventCreate: [],
	guildScheduledEventDelete: [],
	guildScheduledEventUpdate: [],
	guildScheduledEventUserAdd: [],
	guildScheduledEventUserRemove: [],
	guildOnboardingPromptCreate: [],
	guildOnboardingPromptDelete: [],
	guildOnboardingPromptUpdate: [],
	guildOnboardingCreate: [],
	guildOnboardingUpdate: [],
	guildHomeSettingsCreate: [],
	guildHomeSettingsUpdate: [],
	integrationCreate: [],
	integrationDelete: [],
	integrationUpdate: [],
	interactionCreate: [],
	inviteCreate: [],
	inviteDelete: [],
	inviteUpdate: [],
	messageCreate: [],
	messageDelete: [],
	messageUpdate: [],
	messageDeleteBulk: [],
	messageReactionAdd: [],
	messageReactionRemove: [],
	messageReactionRemoveAll: [],
	messageReactionRemoveEmoji: [],
	messagePin: [],
	messageUnpin: [],
	presenceUpdate: [],
	stageInstanceCreate: [],
	stageInstanceDelete: [],
	stageInstanceUpdate: [],
	subscriptionCreate: [],
	subscriptionDelete: [],
	subscriptionUpdate: [],
	typingStart: [],
	userUpdate: [],
	voiceChannelEffectSend: [],
	voiceStateUpdate: [],
	voiceServerUpdate: [],
	webhooksUpdate: [],
	webhookCreate: [],
	webhookDelete: [],
	webhookUpdate: [],
	messagePollVoteAdd: [],
	messagePollVoteRemove: [],
	creatorMonetizationRequestCreated: [],
	creatorMonetizationTermsAccepted: [],
};

export type ClientOptions = {
	intents: GatewayIntents[];
	presence?: GatewayOptions["presence"];
	rest?: Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">;
	shard?: GatewayOptions["shard"];
	version: ApiVersions;
	ws?: Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">;
};

export class Client extends EventEmitter<typeof ClientEvents> {
	public constructor(
		public token: string,
		private readonly options: ClientOptions,
	) {
		super();
	}

	private _ws?: Gateway;

	public get ws(): Gateway {
		if (!this._ws) {
			this._ws = new Gateway(this.token, {
				intents: this.calculateIntents(),
				presence: this.options.presence,
				shard: this.options.shard,
				v: this.options.version,
				compress: this.options.ws?.compress,
				encoding: this.options.ws?.encoding ?? "etf",
				large_threshold: this.options.ws?.large_threshold,
			});
		}

		return this._ws;
	}

	private _rest?: Rest;

	public get rest(): Rest {
		if (!this._rest) {
			this._rest = new Rest(this.token, {
				version: this.options.version,
				cache_life_time: this.options.rest?.cache_life_time,
				user_agent: this.options.rest?.user_agent,
				auth_type: this.options.rest?.auth_type,
			});
		}

		return this._rest;
	}

	private calculateIntents(): Integer {
		return this.options.intents.reduce<Integer>(
			(acc, intent) => acc | intent,
			0,
		);
	}
}
