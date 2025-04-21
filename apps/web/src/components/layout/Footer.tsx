import { DISCORD_LINK, GITHUB_REPO } from "@/utils/constants";
import { Github } from "lucide-react";
import Link from "next/link";
import type React from "react";

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    href: GITHUB_REPO,
    icon: <Github className="h-6 w-6" />,
  },
  {
    name: "Discord",
    href: DISCORD_LINK,
    icon: <svg className="h-6 w-6" />,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

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

      {/* Optional: Add resources links */}
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
