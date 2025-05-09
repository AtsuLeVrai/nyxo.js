"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { DISCORD_LINK, GITHUB_REPO } from "@/utils/constants";
import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";

/**
 * Call to Action section for user conversion
 */
export default function CTA(): ReactElement {
  return (
    <div className="relative overflow-hidden bg-dark-800 py-24">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <h2 className="font-extrabold text-3xl text-white tracking-tight sm:text-4xl">
            <span className="block">
              Ready to transform your Discord bot development?
            </span>
            <span className="mt-2 block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              Start building with Nyxo.js today.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
            Join our community of developers creating next-generation Discord
            bots with a modern TypeScript framework.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              href={GITHUB_REPO}
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight className="h-5 w-5" />}
              external
            >
              Star on GitHub
            </Button>

            <Button href={DISCORD_LINK} variant="secondary" size="lg" external>
              Join our Discord
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
