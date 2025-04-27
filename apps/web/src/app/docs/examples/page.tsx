"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  ChevronRight,
  Clock,
  Code,
  Database,
  MessageSquare,
  Server,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type React from "react";

import { DocsSidebar } from "@/components/layout/DocsSidebar";
import { CodeExamples } from "@/components/sections/CodeExamples";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fadeInUp } from "@/utils/animations";
import { GITHUB_REPO } from "@/utils/constants";

// Define example categories and projects
const exampleProjects = [
  {
    id: "basic-bot",
    title: "Basic Bot",
    description: "A simple bot with command handling and event listening",
    icon: <Bot className="h-6 w-6 text-primary-400" />,
    tags: ["Beginner", "Commands", "Events"],
    difficulty: "easy",
    url: "/docs/examples/basic-bot",
    github: `${GITHUB_REPO}/tree/main/examples/basic-bot`,
  },
  {
    id: "slash-commands",
    title: "Slash Commands",
    description:
      "Advanced slash command implementation with options and subcommands",
    icon: <Terminal className="h-6 w-6 text-primary-400" />,
    tags: ["Slash Commands", "Interactions"],
    difficulty: "medium",
    url: "/docs/examples/slash-commands",
    github: `${GITHUB_REPO}/tree/main/examples/slash-commands`,
  },
  {
    id: "database-integration",
    title: "Database Integration",
    description: "Connect your bot to MongoDB for data persistence",
    icon: <Database className="h-6 w-6 text-primary-400" />,
    tags: ["Database", "MongoDB", "Persistence"],
    difficulty: "medium",
    isNew: true,
    url: "/docs/examples/database-integration",
    github: `${GITHUB_REPO}/tree/main/examples/database-integration`,
  },
  {
    id: "moderation-bot",
    title: "Moderation Bot",
    description: "Server moderation features with logging and auto-moderation",
    icon: <AlertCircle className="h-6 w-6 text-primary-400" />,
    tags: ["Moderation", "Logging", "Permissions"],
    difficulty: "hard",
    url: "/docs/examples/moderation-bot",
    github: `${GITHUB_REPO}/tree/main/examples/moderation-bot`,
  },
  {
    id: "music-bot",
    title: "Music Bot",
    description: "Play music from YouTube and other sources in voice channels",
    icon: <Zap className="h-6 w-6 text-primary-400" />,
    tags: ["Voice", "Media", "Stream"],
    difficulty: "hard",
    isNew: true,
    url: "/docs/examples/music-bot",
    github: `${GITHUB_REPO}/tree/main/examples/music-bot`,
  },
  {
    id: "welcome-system",
    title: "Welcome System",
    description:
      "Customizable welcome messages and role assignment for new members",
    icon: <MessageSquare className="h-6 w-6 text-primary-400" />,
    tags: ["Events", "Roles", "Messages"],
    difficulty: "medium",
    url: "/docs/examples/welcome-system",
    github: `${GITHUB_REPO}/tree/main/examples/welcome-system`,
  },
];

// Sample code for one of the examples
const slashCommandExample = "In Progress...";

// Component for difficulty badge
const DifficultyBadge = ({
  difficulty,
}: { difficulty: "easy" | "medium" | "hard" }) => {
  const variants = {
    easy: "success",
    medium: "warning",
    hard: "danger",
  };

  return (
    <Badge
      variant={variants[difficulty] as "success" | "warning" | "danger"}
      size="xs"
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};

export default function ExamplesPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-dark-700 pt-16">
      {/* Page header */}
      <div className="border-dark-500 border-b bg-dark-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center text-slate-400 text-sm">
                <Link href="/docs" className="hover:text-primary-400">
                  Documentation
                </Link>
                <ChevronRight className="mx-1 h-4 w-4" />
                <span className="text-slate-300">Examples</span>
              </div>

              <h1 className="font-extrabold text-3xl text-slate-50 sm:text-4xl">
                Example Projects
              </h1>
              <p className="mt-2 text-lg text-slate-300">
                Ready-to-use example bots and code snippets to jumpstart your
                Discord bot development
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Button
                href={`${GITHUB_REPO}/tree/main/examples`}
                variant="outline"
                leadingIcon={<Code className="h-5 w-5" />}
                external
              >
                View All Examples
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-20">
              <DocsSidebar className="overflow-hidden rounded-lg border border-dark-500 bg-dark-600" />
            </div>
          </div>

          {/* Content */}
          <main className="lg:col-span-9">
            {/* Mobile sidebar */}
            <div className="mb-8 lg:hidden">
              <DocsSidebar />
            </div>

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="mb-4 font-bold text-2xl text-slate-50">
                Introduction
              </h2>
              <p className="mb-4 text-slate-300">
                These examples demonstrate how to use Nyxo.js to build various
                types of Discord bots. Each example includes a complete project
                that you can run directly or use as a starting point for your
                own bot.
              </p>
              <p className="mb-4 text-slate-300">
                All examples are available on GitHub and include detailed README
                files with step-by-step instructions for setup and deployment.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="#beginner-examples">
                  <Badge
                    variant="success"
                    size="md"
                    className="cursor-pointer"
                    animated
                  >
                    Beginner Examples
                  </Badge>
                </Link>
                <Link href="#intermediate-examples">
                  <Badge
                    variant="warning"
                    size="md"
                    className="cursor-pointer"
                    animated
                  >
                    Intermediate Examples
                  </Badge>
                </Link>
                <Link href="#advanced-examples">
                  <Badge
                    variant="danger"
                    size="md"
                    className="cursor-pointer"
                    animated
                  >
                    Advanced Examples
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Featured example */}
            <section className="mb-16">
              <h2 className="mb-6 font-bold text-2xl text-slate-50">
                Featured Example
              </h2>

              <div className="overflow-hidden rounded-lg border border-dark-500 bg-dark-800">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-lg bg-primary-500/10 p-3">
                        <Terminal className="h-8 w-8 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xl">
                          Slash Commands Example
                        </h3>
                        <p className="text-slate-300">
                          Implementation of advanced slash commands with
                          subcommands
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DifficultyBadge difficulty="medium" />
                      <Badge variant="primary" size="xs">
                        Popular
                      </Badge>
                    </div>
                  </div>

                  <CodeExamples
                    examples={[
                      {
                        title: "Role Management Command",
                        description:
                          "A slash command for adding and removing roles",
                        code: slashCommandExample,
                        language: "typescript",
                        fileName: "commands/role.ts",
                        highlightedLines: [4, 5, 6, 7, 8, 38, 39],
                      },
                    ]}
                    interactive={true}
                    showPlayground={true}
                  />

                  <div className="mt-6 flex justify-end">
                    <Button
                      href="/docs/examples/slash-commands"
                      variant="primary"
                      size="md"
                      trailingIcon={<ChevronRight className="h-5 w-5" />}
                    >
                      View Full Example
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* All examples grid */}
            <section id="all-examples" className="mb-16">
              <h2 className="mb-6 font-bold text-2xl text-slate-50">
                All Example Projects
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {exampleProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    custom={index}
                  >
                    <Link href={project.url}>
                      <Card
                        variant="elevated"
                        className="h-full transition-colors duration-300 hover:border-primary-500/30"
                        animate={false}
                      >
                        <Card.Body>
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="mr-3 rounded-md bg-primary-500/10 p-2">
                                {project.icon}
                              </div>
                              <div>
                                <Card.Title>{project.title}</Card.Title>
                                {project.isNew && (
                                  <Badge
                                    variant="success"
                                    size="xs"
                                    className="mt-1"
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <DifficultyBadge
                              difficulty={
                                project.difficulty as "easy" | "medium" | "hard"
                              }
                            />
                          </div>

                          <Card.Description className="mb-6">
                            {project.description}
                          </Card.Description>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <Badge key={tag} variant="neutral" size="xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-auto flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary-400"
                              trailingIcon={
                                <ChevronRight className="h-4 w-4" />
                              }
                            >
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Getting help section */}
            <section className="mb-12">
              <div className="rounded-lg border border-dark-500 bg-dark-800 p-6">
                <h2 className="mb-4 flex items-center font-bold text-slate-50 text-xl">
                  <Server className="mr-2 h-6 w-6 text-primary-400" />
                  Need Help with Examples?
                </h2>
                <p className="mb-4 text-slate-300">
                  Having trouble with one of our examples? Join our community
                  Discord server to get help from other developers and the
                  Nyxo.js team.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    href="/discord"
                    variant="primary"
                    leadingIcon={<MessageSquare className="h-5 w-5" />}
                  >
                    Join Discord Community
                  </Button>
                  <Button
                    href={`${GITHUB_REPO}/issues`}
                    variant="outline"
                    external
                  >
                    Report an Issue
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
