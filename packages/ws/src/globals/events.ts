import type { GatewayOpcodes, Integer } from "@nyxjs/core";
import type { RequestGuildMembersRequestStructure } from "../events/guilds";
import type { IdentifyStructure } from "../events/identity";
import type { UpdatePresenceGatewayPresenceUpdateStructure } from "../events/presences";
import type { ResumeStructure } from "../events/resume";
import type { UpdateVoiceStateGatewayVoiceStateUpdateStructure } from "../events/voices";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#send-events}
 */
export type GatewaySendEvents = {
	[GatewayOpcodes.Identify]: IdentifyStructure;
	[GatewayOpcodes.Resume]: ResumeStructure;
	[GatewayOpcodes.Heartbeat]: Integer | null;
	[GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersRequestStructure;
	[GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateGatewayVoiceStateUpdateStructure;
	[GatewayOpcodes.PresenceUpdate]: UpdatePresenceGatewayPresenceUpdateStructure;
};
