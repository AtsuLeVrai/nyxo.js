"use client";

import { type Variants, motion } from "framer-motion";
import { Users } from "lucide-react";
import {
  FadeIn,
  FadeInStagger,
  fadeVariants,
} from "~/components/animations/FadeIn";
import { Badge } from "~/components/ui/Badge";
import { Card } from "~/components/ui/Card";

interface TestimonialProps {
  /** Testimonial author's name */
  name: string;
  /** Initials for the avatar */
  initials: string;
  /** Author's role or position */
  role: string;
  /** Testimonial content */
  content: string;
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialProps }) {
  return (
    <Card variant="testimonial">
      <div className="px-6 py-8">
        <div className="flex items-center">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/10">
            <span className="font-medium text-lg text-primary-400">
              {testimonial.initials}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-lg text-white">
              {testimonial.name}
            </h3>
            <div className="font-medium text-primary-400 text-sm">
              {testimonial.role}
            </div>
          </div>
        </div>
        <div className="mt-4 text-base text-slate-300">
          "{testimonial.content}"
        </div>
      </div>
    </Card>
  );
}

export default function Testimonials() {
  // Testimonials data
  const testimonials: TestimonialProps[] = [
    {
      name: "Mark Johnson",
      initials: "M",
      role: "Discord Bot Developer",
      content:
        "Nyxo.js has completely transformed how I build Discord bots. The TypeScript integration is flawless and the framework is intuitive yet powerful.",
    },
    {
      name: "Sarah Chen",
      initials: "S",
      role: "Full Stack Developer",
      content:
        "I've tried many Discord bot frameworks, but Nyxo.js stands out with its modern architecture and excellent developer experience. Highly recommended!",
    },
    {
      name: "David Williams",
      initials: "D",
      role: "Community Server Owner",
      content:
        "As someone managing a large Discord community, Nyxo.js has made it much easier to build reliable custom bots that perfectly fit our server's needs.",
    },
  ];

  return (
    <div className="bg-dark-800 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 text-center">
            <Badge icon={<Users size={14} />} variant="primary">
              Testimonials
            </Badge>
            <h2 className="mt-4 font-extrabold text-3xl text-slate-50 sm:text-4xl">
              Developers love Nyxo.js
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
              Discover how developers around the world are using Nyxo.js to
              build better Discord bots with less hassle.
            </p>
          </div>
        </FadeIn>

        <FadeInStagger className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={fadeVariants.hidden as unknown as Variants}
              custom={index * 0.1}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </FadeInStagger>
      </div>
    </div>
  );
}
