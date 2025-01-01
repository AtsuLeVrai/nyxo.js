/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#resume-resume-structure}
 */
export interface ResumeEntity {
  token: string;
  session_id: string;
  seq: number;
}
