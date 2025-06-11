"use client";

import {
  ArrowRight,
  GitFork,
  Github,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FadeIn } from "~/components/animations/FadeIn";
import { Button } from "~/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO } from "~/utils/constants";

/**
 * GitHub repository statistics interface
 */
interface GitHubStats {
  /** Number of stars on the repository */
  stars: number;
  /** Number of forks of the repository */
  forks: number;
  /** Whether the API request is currently in progress */
  loading: boolean;
  /** Whether an error occurred during the API request */
  error: boolean;
}

/**
 * Call-to-Action section component for the landing page
 *
 * This component renders a comprehensive CTA section that includes:
 * - Primary action buttons for documentation and GitHub
 * - Real-time GitHub statistics fetching
 * - Community stats display with visual cards
 * - Secondary action buttons for additional resources
 * - Responsive design with background effects
 *
 * Features:
 * - Fetches live GitHub stats with error handling and fallbacks
 * - Number formatting for large values (1000+ becomes 1.0k)
 * - Accessible design with proper ARIA labels
 * - Multiple CTAs for different user journeys
 * - Visual stat cards with icons and blur effects
 *
 * @returns JSX element containing the complete CTA section
 */
export default function CTA() {
  // State for managing GitHub API data and loading states
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    stars: 0,
    forks: 0,
    loading: true,
    error: false,
  });

  /**
   * Fetches GitHub repository statistics from the GitHub API
   * Includes error handling with fallback values and proper loading states
   */
  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/AtsuLeVrai/nyxo.js",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setGithubStats({
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            loading: false,
            error: false,
          });
        } else {
          throw new Error("Failed to fetch repository data");
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
        // Set fallback values when API fails
        setGithubStats({
          stars: 120, // Fallback star count
          forks: 15, // Fallback fork count
          loading: false,
          error: true,
        });
      }
    };

    fetchGitHubStats();
  }, []);

  /**
   * Formats numbers for better display readability
   * Converts numbers 1000+ to "k" notation (e.g., 1200 → "1.2k")
   * @param num - The number to format
   * @returns Formatted string representation of the number
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <section
      className="relative bg-dark-800 py-24"
      aria-label="Call to action section"
    >
      {/* Background visual effects */}
      <div className="absolute inset-0">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-10" />
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.2),transparent_70%)]" />

        {/* Decorative blur orbs for visual interest */}
        <div className="absolute top-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          {/* Primary heading with gradient text effect */}
          <h2 className="font-extrabold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
            <span className="block">
              Ready to revolutionize your Discord bot development?
            </span>
            <span className="mt-2 block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              Join the Nyxo.js community today.
            </span>
          </h2>

          {/* Supporting description text */}
          <p className="mx-auto mt-6 max-w-3xl text-slate-300 text-xl leading-relaxed">
            Become part of a growing ecosystem of developers building
            next-generation Discord bots with modern TypeScript tools and best
            practices.
          </p>

          {/* Primary action buttons */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              href="/docs"
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight className="h-5 w-5" />}
              className="min-w-[220px] text-lg"
            >
              Start Building Now
            </Button>

            <Button
              href={GITHUB_REPO}
              variant="secondary"
              size="lg"
              external
              leadingIcon={<Github className="h-5 w-5" />}
              className="min-w-[220px] text-lg"
            >
              {githubStats.loading
                ? "GitHub"
                : `Star on GitHub (${formatNumber(githubStats.stars)})`}
            </Button>
          </div>

          {/* Secondary community action */}
          <div className="mt-6">
            <Button
              href={DISCORD_LINK}
              variant="ghost"
              size="md"
              external
              leadingIcon={<MessageSquare className="h-5 w-5" />}
              className="text-primary-400 hover:text-primary-300"
            >
              Join our Discord Community
            </Button>
          </div>
        </FadeIn>

        {/* Community statistics cards */}
        <FadeIn delay={0.3}>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {/* GitHub Stars stat card */}
            <div className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm">
              {/* Decorative background blur effect */}
              <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-primary-500/10 blur-xl" />
              <div className="relative">
                <Star className="mx-auto mb-3 h-8 w-8 text-primary-400" />
                <div className="font-bold text-2xl text-white">
                  {githubStats.loading
                    ? "..."
                    : formatNumber(githubStats.stars)}
                </div>
                <div className="text-slate-400 text-sm">GitHub Stars</div>
              </div>
            </div>

            {/* Community Members stat card */}
            <div className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm">
              <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-cyan-500/10 blur-xl" />
              <div className="relative">
                <Users className="mx-auto mb-3 h-8 w-8 text-cyan-400" />
                <div className="font-bold text-2xl text-white">1+</div>
                <div className="text-slate-400 text-sm">Community Members</div>
              </div>
            </div>

            {/* GitHub Forks stat card */}
            <div className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm">
              <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-purple-500/10 blur-xl" />
              <div className="relative">
                <GitFork className="mx-auto mb-3 h-8 w-8 text-purple-400" />
                <div className="font-bold text-2xl text-white">
                  {githubStats.loading
                    ? "..."
                    : formatNumber(githubStats.forks)}
                </div>
                <div className="text-slate-400 text-sm">GitHub Forks</div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Final call to action section */}
        <FadeIn delay={0.5}>
          <div className="mt-16 text-center">
            <p className="mb-6 text-lg text-slate-300">
              Ready to build the future of Discord bots? 🚀
            </p>
            <div className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
              <Button
                href="/docs/installation"
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Quick Start Guide
              </Button>
              <Button
                href="/docs/examples/basic"
                variant="ghost"
                size="lg"
                className="flex-1 text-primary-400"
              >
                View Examples
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
