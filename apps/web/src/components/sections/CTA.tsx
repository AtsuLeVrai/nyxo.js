"use client";

import { motion, useReducedMotion } from "framer-motion";
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

interface GitHubStats {
  stars: number;
  forks: number;
  loading: boolean;
  error: boolean;
}

export default function CTA() {
  const shouldReduceMotion = useReducedMotion();
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    stars: 0,
    forks: 0,
    loading: true,
    error: false,
  });

  // Fetch GitHub stats
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
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
        setGithubStats({
          stars: 120, // Fallback values
          forks: 15,
          loading: false,
          error: true,
        });
      }
    };

    fetchGitHubStats();
  }, []);

  // Format numbers for display
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
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.2),transparent_70%)]" />

        {/* Animated orbs with reduced motion support */}
        <motion.div
          className="absolute top-0 left-0 h-[50vh] w-[50vh] rounded-full bg-primary-500/10"
          style={{ filter: "blur(100px)" }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ["-25%", "5%", "-25%"],
                  y: ["-25%", "10%", "-25%"],
                }
          }
          transition={{
            duration: 20,
            repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-0 bottom-0 h-[40vh] w-[40vh] rounded-full bg-cyan-500/10"
          style={{ filter: "blur(100px)" }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ["25%", "-5%", "25%"],
                  y: ["25%", "-10%", "25%"],
                }
          }
          transition={{
            duration: 25,
            repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          {/* Main heading */}
          <h2 className="font-extrabold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
            <span className="block">
              Ready to revolutionize your Discord bot development?
            </span>
            <span className="mt-2 block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              Join the Nyxo.js community today.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-slate-300 text-xl leading-relaxed">
            Become part of a growing ecosystem of developers building
            next-generation Discord bots with modern TypeScript tools and best
            practices.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              href="/docs"
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight className="h-5 w-5" />}
              className="min-w-[220px] text-lg"
              animated={!shouldReduceMotion}
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
              animated={!shouldReduceMotion}
            >
              {githubStats.loading
                ? "GitHub"
                : `Star on GitHub (${formatNumber(githubStats.stars)})`}
            </Button>
          </div>

          {/* Secondary action */}
          <div className="mt-6">
            <Button
              href={DISCORD_LINK}
              variant="ghost"
              size="md"
              external
              leadingIcon={<MessageSquare className="h-5 w-5" />}
              className="text-primary-400 hover:text-primary-300"
              animated={!shouldReduceMotion}
            >
              Join our Discord Community
            </Button>
          </div>
        </FadeIn>

        {/* Community stats */}
        <FadeIn delay={shouldReduceMotion ? 0 : 0.3}>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {/* GitHub Stars */}
            <motion.div
              className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm"
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>

            {/* Community Members */}
            <motion.div
              className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm"
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-cyan-500/10 blur-xl" />
              <div className="relative">
                <Users className="mx-auto mb-3 h-8 w-8 text-cyan-400" />
                <div className="font-bold text-2xl text-white">1+</div>
                <div className="text-slate-400 text-sm">Community Members</div>
              </div>
            </motion.div>

            {/* GitHub Forks */}
            <motion.div
              className="relative overflow-hidden rounded-xl border border-dark-500/50 bg-dark-700/30 p-6 text-center backdrop-blur-sm"
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          </div>
        </FadeIn>

        {/* Developer testimonial */}
        {/*<FadeIn delay={shouldReduceMotion ? 0 : 0.5}>*/}
        {/*  <div className="mx-auto mt-16 max-w-3xl">*/}
        {/*    <div className="relative overflow-hidden rounded-2xl border border-dark-500/30 bg-gradient-to-br from-dark-700/50 via-dark-600/30 to-dark-700/50 p-8 backdrop-blur-sm">*/}
        {/*      <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />*/}
        {/*      <div className="absolute right-0 bottom-0 h-20 w-20 rounded-full bg-cyan-500/10 blur-2xl" />*/}

        {/*      <div className="relative text-center">*/}
        {/*        <blockquote className="mb-6 text-lg text-slate-300 italic leading-relaxed">*/}
        {/*          "Lorem ipsum dolor sit amet, consectetur adipisicing elit.*/}
        {/*          Blanditiis eligendi, fugiat id libero mollitia nam non nulla*/}
        {/*          numquam quos, recusandae vel vero! Deleniti dolorum explicabo*/}
        {/*          modi mollitia nam quia quisquam quod sequi veritatis vero!*/}
        {/*          Alias, aliquam atque culpa dolore ducimus eligendi fugiat*/}
        {/*          fugit, minima, odio perspiciatis placeat quod tempore vel?*/}
        {/*          Debitis, natus."*/}
        {/*        </blockquote>*/}
        {/*        <div className="flex items-center justify-center">*/}
        {/*          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-cyan-500 font-bold text-white">*/}
        {/*            A*/}
        {/*          </div>*/}
        {/*          <div className="text-left">*/}
        {/*            <div className="font-medium text-white">John Doe</div>*/}
        {/*            <div className="text-slate-400 text-sm">*/}
        {/*              Senior Discord Bot Developer*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</FadeIn>*/}

        {/* Final call to action */}
        <FadeIn delay={shouldReduceMotion ? 0 : 0.7}>
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
                animated={!shouldReduceMotion}
              >
                Quick Start Guide
              </Button>
              <Button
                href="/docs/examples/basic"
                variant="ghost"
                size="lg"
                className="flex-1 text-primary-400"
                animated={!shouldReduceMotion}
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
