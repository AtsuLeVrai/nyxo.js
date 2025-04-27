"use client";

import { motion } from "framer-motion";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  File,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

import { DocsSidebar } from "@/components/layout/DocsSidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeBlock, type ProgrammingLanguage } from "@/components/ui/CodeBlock";
import { Tabs } from "@/components/ui/Tabs";
import { useScrollSpy } from "@/hooks";
import { GITHUB_REPO } from "@/utils/constants";

// Sample API reference code
const clientApiCode = "In Progress...";

const commandApiCode = "In Progress...";

const eventApiCode = "In Progress...";

const utilsApiCode = "In Progress...";

// API categories
const apiCategories = [
  {
    id: "client-api",
    title: "Client API",
    description: "The core client class for interacting with Discord",
    code: clientApiCode,
    language: "typescript",
    methods: [
      {
        name: "start()",
        description: "Starts the bot and connects to Discord",
      },
      {
        name: "stop()",
        description: "Safely disconnects the bot from Discord",
      },
      {
        name: "registerCommand(command)",
        description: "Registers a single command",
      },
      {
        name: "registerEvent(event)",
        description: "Registers a single event handler",
      },
      {
        name: "loadCommands(path)",
        description: "Loads commands from a directory",
      },
      {
        name: "loadEvents(path)",
        description: "Loads events from a directory",
      },
      {
        name: "setActivity(options)",
        description: "Sets the bot's presence activity",
      },
      {
        name: "deployCommands(options)",
        description: "Deploys slash commands to Discord",
      },
    ],
  },
  {
    id: "command-api",
    title: "Command API",
    description: "Creating and handling bot commands",
    code: commandApiCode,
    language: "typescript",
    methods: [
      {
        name: "Command interface",
        description: "Structure for defining commands",
      },
      {
        name: "CommandContext",
        description: "Context object passed to command handlers",
      },
      {
        name: "SlashCommand interface",
        description: "Structure for slash commands",
      },
      {
        name: "SlashCommandContext",
        description: "Context for slash command handlers",
      },
      {
        name: "registerCommand(command)",
        description: "Registers a command with the client",
      },
      {
        name: "loadCommands(path)",
        description: "Loads commands from a directory",
      },
    ],
  },
  {
    id: "event-api",
    title: "Event API",
    description: "Handling Discord events",
    code: eventApiCode,
    language: "typescript",
    methods: [
      {
        name: "Event<T> interface",
        description: "Type-safe interface for Discord.js events",
      },
      {
        name: "registerEvent(event)",
        description: "Registers an event handler",
      },
      {
        name: "loadEvents(path)",
        description: "Loads event handlers from a directory",
      },
      {
        name: "once property",
        description: "Whether the event should only trigger once",
      },
    ],
  },
  {
    id: "utils-api",
    title: "Utilities API",
    description: "Helper functions and utilities",
    code: utilsApiCode,
    language: "typescript",
    methods: [
      {
        name: "formatTime(seconds)",
        description: "Formats seconds into a readable duration",
      },
      {
        name: "createEmbed(options)",
        description: "Creates a Discord embed with options",
      },
      {
        name: "paginate(message, pages, options)",
        description: "Creates paginated messages",
      },
      {
        name: "wait(ms)",
        description: "Promise that resolves after the specified milliseconds",
      },
      {
        name: "chunk(array, size)",
        description: "Splits an array into chunks of the specified size",
      },
      {
        name: "random(min, max)",
        description: "Generates a random number between min and max",
      },
    ],
  },
];

export default function ApiDocsPage(): React.ReactElement {
  // Create refs for scrollspy
  const sectionRefs = useRef(
    apiCategories.map(() => React.createRef<HTMLElement>()),
  );

  // Use scrollspy hook to highlight active section
  const activeSection = useScrollSpy(
    sectionRefs.current as React.RefObject<HTMLElement>[],
    { rootMargin: "-100px 0px -60% 0px" },
  );

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
                <span className="text-slate-300">API Reference</span>
              </div>

              <h1 className="font-extrabold text-3xl text-slate-50 sm:text-4xl">
                Nyxo.js API Reference
              </h1>
              <p className="mt-2 text-lg text-slate-300">
                Complete reference documentation for all Nyxo.js classes,
                methods, and interfaces
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Button
                href={`${GITHUB_REPO}/blob/main/docs/API.md`}
                variant="outline"
                leadingIcon={<Book className="h-5 w-5" />}
                external
              >
                GitHub Documentation
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

              {/* API Navigation */}
              <div className="mt-8 overflow-hidden rounded-lg border border-dark-500 bg-dark-600">
                <div className="border-dark-500 border-b bg-dark-700 px-4 py-3">
                  <h3 className="font-bold text-lg text-slate-100">
                    On This Page
                  </h3>
                </div>
                <nav className="p-4">
                  <ul className="space-y-2">
                    {apiCategories.map((category, index) => (
                      <li key={category.id}>
                        <a
                          href={`#${category.id}`}
                          className={`flex items-center rounded-md px-3 py-1 text-sm transition-colors ${
                            activeSection === index
                              ? "bg-primary-500/10 text-primary-400"
                              : "text-slate-300 hover:text-primary-300"
                          }`}
                        >
                          {category.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
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
                The Nyxo.js API is built with TypeScript to provide fully
                type-safe interactions with Discord. This reference covers all
                the classes, methods, and interfaces available in the library.
              </p>
              <p className="mb-4 text-slate-300">
                The API is designed to be intuitive and easy to use, while also
                providing powerful tools for building complex Discord bots. Each
                section below provides examples and reference documentation for
                a specific part of the API.
              </p>

              <div className="mt-6 rounded-lg border border-dark-500 bg-dark-800 p-4">
                <div className="flex items-start">
                  <Code className="mt-0.5 mr-3 h-5 w-5 text-primary-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-lg text-slate-200">
                      API Versioning
                    </h3>
                    <p className="text-slate-300">
                      Nyxo.js follows semantic versioning. The API documented
                      here applies to the current stable version. Breaking
                      changes are only introduced in major version updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API sections */}
            {apiCategories.map((category, index) => (
              <motion.section
                key={category.id}
                ref={sectionRefs.current[index] as React.RefObject<HTMLElement>}
                id={category.id}
                className="mb-16 scroll-mt-20 border-dark-500 border-b pb-8 last:border-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500/10 text-primary-400">
                      <File className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2
                      className="mb-3 font-bold text-2xl text-slate-50"
                      id={category.id}
                    >
                      {category.title}
                      <Badge className="ml-3" variant="primary" size="sm">
                        API
                      </Badge>
                    </h2>
                    <p className="mb-6 text-slate-300">
                      {category.description}
                    </p>

                    <div className="mb-8">
                      <CodeBlock
                        code={category.code}
                        language={category.language as ProgrammingLanguage}
                        title={`${category.title} Example`}
                        showLineNumbers={true}
                      />
                    </div>

                    <div className="mb-4">
                      <h3 className="mb-4 font-semibold text-slate-100 text-xl">
                        Methods & Properties
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-dark-500 bg-dark-800">
                        <table className="w-full text-left">
                          <thead className="bg-dark-700">
                            <tr>
                              <th className="border-dark-500 border-b px-4 py-3 font-medium text-slate-300 text-sm">
                                Name
                              </th>
                              <th className="border-dark-500 border-b px-4 py-3 font-medium text-slate-300 text-sm">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.methods.map((method, methodIndex) => (
                              <tr
                                key={methodIndex}
                                className={
                                  methodIndex % 2 === 0 ? "bg-dark-700/30" : ""
                                }
                              >
                                <td className="border-dark-500/50 border-b px-4 py-3 font-mono text-primary-400 text-sm last:border-b-0">
                                  {method.name}
                                </td>
                                <td className="border-dark-500/50 border-b px-4 py-3 text-slate-300 text-sm last:border-b-0">
                                  {method.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        href={`/docs/api/${category.id}`}
                        variant="outline"
                        size="sm"
                        className="text-primary-400"
                        trailingIcon={<ChevronRight className="h-4 w-4" />}
                      >
                        View detailed documentation
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}

            {/* Navigation */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-dark-500 border-t pt-6">
              <Link
                href="/docs/core-concepts"
                className="flex items-center rounded-lg border border-dark-500 px-4 py-2 hover:border-primary-500/30 hover:bg-dark-600"
              >
                <div className="mr-3 text-slate-300">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Previous</div>
                  <div className="font-medium text-slate-300">
                    Core Concepts
                  </div>
                </div>
              </Link>

              <Link
                href="/docs/examples"
                className="flex items-center justify-end rounded-lg border border-dark-500 px-4 py-2 text-right hover:border-primary-500/30 hover:bg-dark-600"
              >
                <div>
                  <div className="text-slate-400 text-sm">Next</div>
                  <div className="font-medium text-slate-300">Examples</div>
                </div>
                <div className="ml-3 text-slate-300">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
