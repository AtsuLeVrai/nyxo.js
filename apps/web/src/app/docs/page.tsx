"use client";

import { Layout } from "@/components";
import { jetbrainsMono } from "@/lib";
import { motion } from "framer-motion";
import { Highlight, themes } from "prism-react-renderer";
import type { ReactNode } from "react";

function DocSection({
    title,
    children,
    className = "",
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-lg bg-neutral-800 p-6 ${className}`}
        >
            <h2 className="mb-4 font-semibold text-xl">{title}</h2>
            {children}
        </motion.div>
    );
}

const installationCode = "npm install @nyxjs/core";
const codeBlock = `import { Client, GatewayIntents } from 'nyx.js';

const client = new Client('your-token-here', {
    intents: GatewayIntents.All(),
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.connect();`;

export default function DocPage() {
    return (
        <Layout>
            <div className="flex-1">
                {/* Main content */}
                <main className="flex-1 p-6 lg:p-10">
                    <div className="mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="mb-6 font-bold text-4xl">Documentation</h1>
                            <p className="mb-8 text-gray-300 text-xl">
                                Learn how to build powerful Discord bots with Nyx.js. Find comprehensive guides, API
                                references, and examples.
                            </p>
                        </motion.div>

                        <div className="grid gap-6">
                            <DocSection title="Getting Started">
                                <div className="prose prose-invert max-w-none">
                                    <p>
                                        Welcome to the Nyx.js documentation! This guide will help you get started with
                                        building your first Discord bot using Nyx.js.
                                    </p>
                                    <Highlight
                                        theme={themes.oneDark}
                                        code={installationCode}
                                        language="bash"
                                    >
                                        {({ tokens, getLineProps, getTokenProps }) => (
                                            <pre
                                                className={`mt-4 rounded-lg bg-neutral-900 p-4 ${jetbrainsMono.className}`}
                                            >
                                                {tokens.map((line, i) => (
                                                    <div
                                                        key={i}
                                                        {...getLineProps({ line })}
                                                    >
                                                        {line.map((token, key) => (
                                                            <span
                                                                key={key}
                                                                {...getTokenProps({ token })}
                                                            />
                                                        ))}
                                                    </div>
                                                ))}
                                            </pre>
                                        )}
                                    </Highlight>
                                </div>
                            </DocSection>

                            <DocSection title="Basic Example">
                                <div className="prose prose-invert max-w-none">
                                    <p>Here's a simple example of creating a basic bot with Nyx.js:</p>
                                    <Highlight
                                        theme={themes.oneDark}
                                        code={codeBlock}
                                        language="js"
                                    >
                                        {({ tokens, getLineProps, getTokenProps }) => (
                                            <pre
                                                className={`mt-4 rounded-lg bg-neutral-900 p-4 ${jetbrainsMono.className}`}
                                            >
                                                {tokens.map((line, i) => (
                                                    <div
                                                        key={i}
                                                        {...getLineProps({ line })}
                                                    >
                                                        {line.map((token, key) => (
                                                            <span
                                                                key={key}
                                                                {...getTokenProps({ token })}
                                                            />
                                                        ))}
                                                    </div>
                                                ))}
                                            </pre>
                                        )}
                                    </Highlight>
                                </div>
                            </DocSection>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
}
