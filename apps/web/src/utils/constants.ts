// Social links
export const DISCORD_LINK = "https://discord.gg/hfMzQMbaMg";
export const GITHUB_REPO = "https://github.com/AtsuLeVrai/nyxo.js";
export const GITHUB_LICENSE =
  "https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE";
export const GITHUB_CONTRIBUTORS =
  "https://github.com/AtsuLeVrai/nyxo.js/graphs/contributors";

// Code examples for the documentation
export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  highlightedLines?: number[];
  fileName?: string;
}

// Navigation links for header/footer
export interface NavLink {
  title: string;
  href: string;
  isExternal?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { title: "Docs", href: "/docs" },
  { title: "Examples", href: "/examples" },
  { title: "API", href: "/docs/api" },
  { title: "License", href: GITHUB_LICENSE, isExternal: true },
  { title: "Contributors", href: GITHUB_CONTRIBUTORS, isExternal: true },
];
