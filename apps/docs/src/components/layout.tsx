"use client";

import { Sidebar } from "@/components/sidebar";
import { nyx_icon_transparent } from "@/lib";
import { Book, Github, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

export function Layout({ children }: { readonly children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-neutral-800 bg-opacity-90 p-4 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <Image src={nyx_icon_transparent} alt="Nyx.js Logo" width={40} height={40} />
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
                {children}
            </div>
        </div>
    );
}
