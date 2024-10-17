"use client";

import { motion } from "framer-motion";
import { Book, Code, Coffee, Puzzle, Shield, Terminal, Zap } from "lucide-react";
import React from "react";
import { Layout } from "@/components";
import { fira_code } from "@/lib";

export default function DocPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    };

    return (
        <Layout>
            <div className="bg-neutral-900 text-white min-h-screen p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                        Nyx.js Documentation
                    </h1>

                    <section className="mb-16">
                        <motion.h2 className="text-3xl font-semibold mb-8 text-blue-400" {...fadeInUp}>
                            Getting Started
                        </motion.h2>
                        <motion.div
                            className="bg-neutral-800 p-8 rounded-lg shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            {...fadeInUp}
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-purple-400">Quick Start Guide</h3>
                            <ol className="list-decimal list-inside space-y-4 text-gray-300">
                                <li>
                                    Install Nyx.js using npm:
                                    <motion.pre
                                        className="bg-neutral-900 p-4 rounded-md mt-2 overflow-x-auto"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <code className={`${fira_code.className} text-green-400`}>
                                            npm install nyx.js
                                        </code>
                                    </motion.pre>
                                </li>
                                <li>
                                    Create a new bot file (e.g.,{" "}
                                    <code className="bg-neutral-900 px-2 py-1 rounded">bot.ts</code>):
                                    <motion.pre
                                        className="bg-neutral-900 p-4 rounded-md mt-2 overflow-x-auto"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <code className={`${fira_code.className} text-green-400`}>
                                            {`import { Client } from 'nyx.js';

const client = new Client();

client.on('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', (message) => {
  if (message.content === '!hello') {
    message.reply('Hello, Discord!');
  }
});

client.login('YOUR_BOT_TOKEN');`}
                                        </code>
                                    </motion.pre>
                                </li>
                                <li>
                                    Run your bot:
                                    <motion.pre
                                        className="bg-neutral-900 p-4 rounded-md mt-2 overflow-x-auto"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <code className={`${fira_code.className} text-green-400`}>
                                            npx ts-node bot.ts
                                        </code>
                                    </motion.pre>
                                </li>
                            </ol>
                        </motion.div>
                    </section>

                    <section className="mb-16">
                        <motion.h2 className="text-3xl font-semibold mb-8 text-blue-400" {...fadeInUp}>
                            Core Concepts
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: <Zap size={24} />,
                                    title: "Event Handling",
                                    description: "Learn how to listen and respond to Discord events efficiently.",
                                    color: "text-yellow-400",
                                },
                                {
                                    icon: <Terminal size={24} />,
                                    title: "Command Creation",
                                    description: "Discover how to create and manage bot commands with ease.",
                                    color: "text-green-400",
                                },
                                {
                                    icon: <Shield size={24} />,
                                    title: "Permissions",
                                    description: "Implement role-based command permissions for your bot.",
                                    color: "text-red-400",
                                },
                                {
                                    icon: <Puzzle size={24} />,
                                    title: "Plugins",
                                    description: "Extend your bot's functionality using the plugin system.",
                                    color: "text-purple-400",
                                },
                            ].map((concept, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-neutral-800 p-6 rounded-lg shadow-lg flex items-start"
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    {...fadeInUp}
                                >
                                    <div className={`${concept.color} mr-4 mt-1 flex-shrink-0`}>{concept.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{concept.title}</h3>
                                        <p className="text-gray-400">{concept.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <motion.h2 className="text-3xl font-semibold mb-8 text-blue-400" {...fadeInUp}>
                            Additional Resources
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.a href="#" className="block" whileHover={{ scale: 1.05, rotate: 2 }} {...fadeInUp}>
                                <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full border-t-4 border-blue-400">
                                    <Book className="text-blue-400 mb-4" size={32} />
                                    <h3 className="text-2xl font-semibold mb-2">API Reference</h3>
                                    <p className="text-gray-400">
                                        Comprehensive documentation of Nyx.js classes and methods.
                                    </p>
                                </div>
                            </motion.a>
                            <motion.a href="#" className="block" whileHover={{ scale: 1.05, rotate: -2 }} {...fadeInUp}>
                                <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full border-t-4 border-purple-400">
                                    <Code className="text-purple-400 mb-4" size={32} />
                                    <h3 className="text-2xl font-semibold mb-2">Examples</h3>
                                    <p className="text-gray-400">
                                        Sample projects and code snippets to jumpstart your bot development.
                                    </p>
                                </div>
                            </motion.a>
                            <motion.a href="#" className="block" whileHover={{ scale: 1.05, rotate: 2 }} {...fadeInUp}>
                                <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full border-t-4 border-yellow-400">
                                    <Coffee className="text-yellow-400 mb-4" size={32} />
                                    <h3 className="text-2xl font-semibold mb-2">Community</h3>
                                    <p className="text-gray-400">
                                        Join our Discord server for support and to connect with other developers.
                                    </p>
                                </div>
                            </motion.a>
                        </div>
                    </section>
                </motion.div>
            </div>
        </Layout>
    );
}
