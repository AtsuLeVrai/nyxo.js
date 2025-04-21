"use client";

import { FadeInWhenVisible } from "@/components/animations/MotionEffects";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import React from "react";

// Testimonial type definition
interface TestimonialProps {
  name: string;
  initials: string;
  role: string;
  content: string;
}

// Individual testimonial card component
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
            <Card.Title>{testimonial.name}</Card.Title>
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
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis corporis deleniti enim exercitationem expedita id nesciunt perspiciatis repellendus vel vero!",
    },
    {
      name: "Sarah Chen",
      initials: "S",
      role: "Full Stack Developer",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis corporis deleniti enim exercitationem expedita id nesciunt perspiciatis repellendus vel vero!",
    },
    {
      name: "David Williams",
      initials: "D",
      role: "Community Server Owner",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis corporis deleniti enim exercitationem expedita id nesciunt perspiciatis repellendus vel vero!",
    },
  ];

  return (
    <div className="bg-dark-800 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
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
        </FadeInWhenVisible>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Testimonial cards */}
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.1 },
                },
              }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
