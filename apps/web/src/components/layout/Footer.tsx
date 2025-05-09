import { DISCORD_LINK, GITHUB_REPO } from "@/utils/constants";
import { Github } from "lucide-react";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

interface SocialLink {
  /** Name of the social platform */
  name: string;
  /** Link URL */
  href: string;
  /** Icon element to display */
  icon: ReactNode;
}

/**
 * Footer component for site-wide information and links
 */
export default function Footer(): ReactElement {
  const currentYear = new Date().getFullYear();

  // Social links configuration
  const socialLinks: SocialLink[] = [
    {
      name: "GitHub",
      href: GITHUB_REPO,
      icon: <Github className="h-6 w-6" />,
    },
    {
      name: "Discord",
      href: DISCORD_LINK,
      icon: (
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-dark-500 border-t bg-dark-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        {/* Social links */}
        <div className="flex justify-center space-x-6 md:order-2">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-400 transition-colors hover:text-primary-400"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
            >
              <span className="sr-only">{link.name}</span>
              {link.icon}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-base text-slate-400">
            &copy; {currentYear} Nyxo.js. All rights reserved.
          </p>
        </div>
      </div>

      {/* Resource links */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="border-dark-600 border-t pt-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <h3 className="font-medium text-slate-300 text-sm">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-slate-400 text-sm hover:text-primary-400"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/AtsuLeVrai/nyxo.js/issues"
                    className="text-slate-400 text-sm hover:text-primary-400"
                  >
                    Issues
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-slate-300 text-sm">Community</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href={DISCORD_LINK}
                    className="text-slate-400 text-sm hover:text-primary-400"
                  >
                    Discord
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/AtsuLeVrai/nyxo.js/graphs/contributors"
                    className="text-slate-400 text-sm hover:text-primary-400"
                  >
                    Contributors
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-slate-300 text-sm">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE"
                    className="text-slate-400 text-sm hover:text-primary-400"
                  >
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
