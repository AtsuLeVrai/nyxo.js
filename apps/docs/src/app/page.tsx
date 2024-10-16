"use client";

import { motion } from "framer-motion";
import { ArrowRight, Book, Github, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/components";
import profile from "@/public/nyx.js.jpg";

export default function HomePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-neutral-800 bg-opacity-90 p-4 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <Image src={profile} alt="Nyx.js Logo" width={40} height={40} className="rounded-full" />
                    <h1 className="text-2xl font-bold">Nyx.js</h1>
                </div>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link
                                href="/"
                                className="hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Home size={20} />
                                <span>Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/docs"
                                className="hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Book size={20} />
                                <span>Documentation</span>
                            </Link>
                        </li>
                        <li>
                            <a
                                href="https://github.com/3tatsu/nyx.js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Github size={20} />
                                <span>GitHub</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Main content */}
            <div className="flex flex-1">
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                {/* Main content area */}
                <main className="flex-1 p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <Image
                            src={profile}
                            alt="Nyx.js Logo"
                            width={200}
                            height={200}
                            className="mx-auto mb-8 rounded-full"
                        />
                        <h1 className="text-5xl font-bold mb-6 py-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block">
                            Welcome to Nyx.js
                        </h1>
                        <p className="text-xl mb-8 text-gray-300">
                            A powerful framework for creating Discord bots using TypeScript. Build feature-rich bots
                            with ease and flexibility.
                        </p>
                        <div className="flex justify-center space-x-4 mb-8">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                v1.0.0 Beta
                            </span>
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Stable
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
                            <Link
                                href="/docs"
                                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center">
                                    Get Started
                                    <ArrowRight
                                        size={20}
                                        className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </span>
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                            </Link>
                            <a
                                href="https://github.com/3tatsu/nyx.js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center">
                                    View on GitHub
                                    <Github size={20} className="ml-2" />
                                </span>
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                            </a>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10"
                        >
                            <h2 className="text-3xl font-semibold mb-4">Key Features</h2>
                            <ul className="list-none p-0 space-y-4">
                                <motion.li whileHover={{ scale: 1.05 }} className="mb-2 bg-neutral-800 p-3 rounded-lg">
                                    🚀 Easy to use and extend
                                </motion.li>
                                <motion.li whileHover={{ scale: 1.05 }} className="mb-2 bg-neutral-800 p-3 rounded-lg">
                                    🛠 Built with TypeScript for type safety
                                </motion.li>
                                <motion.li whileHover={{ scale: 1.05 }} className="mb-2 bg-neutral-800 p-3 rounded-lg">
                                    📦 Modular architecture
                                </motion.li>
                                <motion.li whileHover={{ scale: 1.05 }} className="mb-2 bg-neutral-800 p-3 rounded-lg">
                                    🔌 Powerful plugin system
                                </motion.li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
