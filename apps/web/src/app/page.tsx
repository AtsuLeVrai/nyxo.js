"use client";

import { Layout } from "@/components";
import { nyx_banner } from "@/lib";
import { motion } from "framer-motion";
import { ArrowRight, Coffee, Github, Puzzle, Shield, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    return (
        <Layout sidebar={false}>
            <main class="flex-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    class="max-w-4xl mx-auto text-center"
                >
                    <Image src={nyx_banner} alt="Nyx.js Banner" width={500} height={500} class="mx-auto mb-8" />
                    <h1 class="text-5xl font-bold mb-6 py-2 text-white inline-block">Welcome to Nyx.js</h1>
                    <p class="text-xl mb-8 text-gray-300">
                        A powerful framework for creating Discord bots using TypeScript. Build feature-rich bots with
                        ease and flexibility.
                    </p>
                    <div class="flex justify-center space-x-4 mb-8">
                        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            v1.0.0-alpha
                        </span>
                        <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Alpha Release
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
                        <Link
                            href="/docs"
                            class="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                        >
                            <span class="relative z-10 flex items-center">
                                Get Started
                                <ArrowRight
                                    size={20}
                                    class="ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </span>
                            <span class="absolute bottom-0 left-0 w-full h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                        </Link>
                        <a
                            href="https://github.com/3tatsu/nyx.js"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group relative overflow-hidden bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                        >
                            <span class="relative z-10 flex items-center">
                                View on GitHub
                                <Github size={20} class="ml-2" />
                            </span>
                            <span class="absolute bottom-0 left-0 w-full h-1 bg-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                        </a>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        class="mt-10"
                    >
                        <section class="mb-16">
                            <h2 class="text-3xl font-semibold mb-8 text-center">Key Features</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    {
                                        icon: <Terminal size={24} />,
                                        title: "Easy to Use",
                                        description: "Simple API for quick bot development",
                                    },
                                    {
                                        icon: <Shield size={24} />,
                                        title: "Type Safe",
                                        description: "Built with TypeScript for robust code",
                                    },
                                    {
                                        icon: <Puzzle size={24} />,
                                        title: "Modular",
                                        description: "Flexible architecture for complex bots",
                                    },
                                    {
                                        icon: <Coffee size={24} />,
                                        title: "Plugin System",
                                        description: "Extend functionality with ease",
                                    },
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        class="bg-neutral-800 p-6 rounded-lg shadow-lg text-center"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div class="text-blue-400 mb-4">{feature.icon}</div>
                                        <h3 class="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p class="text-gray-400">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                </motion.div>
            </main>
        </Layout>
    );
}
