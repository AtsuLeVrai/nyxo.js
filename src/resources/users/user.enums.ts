export enum ConnectionVisibilityTypes {
  None = 0,
  Everyone = 1,
}

export enum Services {
  AmazonMusic = "amazon-music",
  BattleNet = "battlenet",
  Bluesky = "bluesky",
  Bungie = "bungie",
  Crunchyroll = "crunchyroll",
  Domain = "domain",
  Ebay = "ebay",
  EpicGames = "epicgames",
  Facebook = "facebook",
  GitHub = "github",
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  Mastodon = "mastodon",
  PayPal = "paypal",
  PlayStation = "playstation",
  Reddit = "reddit",
  RiotGames = "riotgames",
  Roblox = "roblox",
  Skype = "skype",
  Spotify = "spotify",
  Steam = "steam",
  TikTok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  YouTube = "youtube",
}

export enum NameplatePalettes {
  Berry = "berry",
  BubbleGum = "bubble_gum",
  Clover = "clover",
  Cobalt = "cobalt",
  Crimson = "crimson",
  Forest = "forest",
  Lemon = "lemon",
  Sky = "sky",
  Teal = "teal",
  Violet = "violet",
  White = "white",
}

export enum PremiumTypes {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

export enum UserFlags {
  Staff = 1 << 0,
  Partner = 1 << 1,
  Hypesquad = 1 << 2,
  BugHunterLevel1 = 1 << 3,
  HypesquadOnlineHouse1 = 1 << 6,
  HypesquadOnlineHouse2 = 1 << 7,
  HypesquadOnlineHouse3 = 1 << 8,
  PremiumEarlySupporter = 1 << 9,
  TeamPseudoUser = 1 << 10,
  BugHunterLevel2 = 1 << 14,
  VerifiedBot = 1 << 16,
  VerifiedDeveloper = 1 << 17,
  CertifiedModerator = 1 << 18,
  BotHttpInteractions = 1 << 19,
  ActiveDeveloper = 1 << 22,
}

export enum ActivityTypes {
  Game = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}
