"use client";

import { motion } from "framer-motion";
import { Book, ChevronRight, Github, Search, Users, Zap } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

import { DocsSidebar } from "@/components/layout/DocsSidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GITHUB_REPO } from "@/utils/constants";

// Sample code for installation
const installCode = `# Using npm
npm install nyxo.js

# Using yarn
yarn add nyxo.js

# Using pnpm
pnpm add nyxo.js

# Using bun
bun add nyxo.js

# Using deno
deno add npm:nyxo.js`;

// Sample basic bot code
const basicBotCode = "In Progress...";

interface DocCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isNew?: boolean;
}

// Documentation categories displayed on the main page
const docCategories: DocCategory[] = [
  {
    title: "Getting Started",
    description:
      "Learn how to install and set up your first Discord bot with Nyxo.js",
    icon: <Book className="h-6 w-6 text-primary-400" />,
    href: "/docs/getting-started",
  },
  {
    title: "Core Concepts",
    description: "Understand the fundamental concepts behind Nyxo.js",
    icon: <Zap className="h-6 w-6 text-primary-400" />,
    href: "/docs/core-concepts",
  },
  {
    title: "Advanced Usage",
    description: "Dive deeper into more complex features and patterns",
    icon: <Users className="h-6 w-6 text-primary-400" />,
    href: "/docs/advanced",
    isNew: true,
  },
  {
    title: "API Reference",
    description: "Detailed API documentation for all Nyxo.js features",
    icon: <Github className="h-6 w-6 text-primary-400" />,
    href: "/docs/api",
  },
];

export default function DocsPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen bg-dark-700 pt-16">
      {/* Documentation header */}
      <div className="border-dark-500 border-b bg-dark-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="primary" size="md" animated>
                Documentation
              </Badge>
              <h1 className="mt-4 font-extrabold text-4xl text-slate-50 sm:text-5xl">
                Nyxo.js Documentation
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
                Everything you need to know about building Discord bots with
                Nyxo.js
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Documentation content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar navigation */}
          <div className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-20">
              <DocsSidebar className="overflow-hidden rounded-lg border border-dark-500 bg-dark-600" />
            </div>
          </div>

          {/* Main content */}
          <main className="lg:col-span-9">
            {/* Mobile sidebar */}
            <div className="mb-8 lg:hidden">
              <DocsSidebar />
            </div>

            {/* Featured documentation sections */}
            <section className="mb-12">
              <h2 className="mb-6 font-bold text-2xl text-slate-50">
                Documentation
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {docCategories.map((category, index) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={category.href}>
                      <Card
                        variant="feature"
                        animate={false}
                        className="hover:-translate-y-1 h-full transition-all duration-200 hover:shadow-md"
                      >
                        <Card.Body className="flex h-full flex-col">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500/10">
                              {category.icon}
                            </div>
                            {category.isNew && (
                              <Badge variant="success" size="xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <Card.Title className="mb-2">
                            {category.title}
                          </Card.Title>
                          <Card.Description className="flex-grow">
                            {category.description}
                          </Card.Description>
                          <div className="mt-4 flex items-center font-medium text-primary-400 text-sm">
                            Browse section
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Quick start guide */}
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-6 font-bold text-2xl text-slate-50">
                  Quick Start
                </h2>

                <div className="mb-8 rounded-lg border border-dark-500 bg-dark-600 p-6">
                  <h3 className="mb-4 font-bold text-slate-50 text-xl">
                    Installation
                  </h3>
                  <p className="mb-6 text-slate-300">
                    Get started with Nyxo.js by installing it via your favorite
                    package manager:
                  </p>

                  <CodeBlock
                    code={installCode}
                    language="bash"
                    title="Install Nyxo.js"
                  />

                  <div className="mt-6">
                    <Button
                      href={`${GITHUB_REPO}#installation`}
                      variant="outline"
                      leadingIcon={<Book className="h-5 w-5" />}
                      external
                    >
                      View detailed installation guide
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-dark-500 bg-dark-600 p-6">
                  <h3 className="mb-4 font-bold text-slate-50 text-xl">
                    Basic Bot Example
                  </h3>
                  <p className="mb-6 text-slate-300">
                    Create your first bot with just a few lines of code:
                  </p>

                  <CodeBlock
                    code={basicBotCode}
                    language="typescript"
                    title="Basic Bot Example"
                    highlightedLines={[4, 14, 15, 16, 17, 18, 22]}
                  />

                  <div className="mt-6">
                    <Button
                      href="/docs/getting-started/quick-start"
                      variant="primary"
                      trailingIcon={<ChevronRight className="h-5 w-5" />}
                    >
                      Continue to Quick Start Guide
                    </Button>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Community section */}
            <section>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-lg border border-dark-500 bg-dark-800 p-8 text-center"
              >
                <h2 className="mb-4 font-bold text-2xl text-slate-50">
                  Join the Community
                </h2>
                <p className="mx-auto mb-6 max-w-2xl text-slate-300">
                  Need help or want to contribute? Join our Discord server to
                  connect with other developers using Nyxo.js and get support
                  from our team.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button href="/discord" variant="primary" size="lg">
                    Join Discord
                  </Button>
                  <Button
                    href={GITHUB_REPO}
                    variant="secondary"
                    size="lg"
                    leadingIcon={<Github className="h-5 w-5" />}
                    external
                  >
                    GitHub Repository
                  </Button>
                </div>
              </motion.div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
