import type {
    AnnouncementChannel,
    BaseChannel,
    CategoryChannel,
    DirectoryChannel,
    DMChannel,
    ForumChannel,
    MediaChannel,
    StageVoiceChannel,
    TextChannel,
    ThreadChannel,
    VoiceChannel,
} from "../structures/Channels";

export type AllChannelTypes =
    | AnnouncementChannel
    | BaseChannel
    | CategoryChannel
    | DirectoryChannel
    | DMChannel
    | ForumChannel
    | MediaChannel
    | StageVoiceChannel
    | TextChannel
    | ThreadChannel
    | VoiceChannel;
