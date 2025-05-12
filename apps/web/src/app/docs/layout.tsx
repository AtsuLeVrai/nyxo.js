"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import {useState} from "react";
import {ChevronDown, ChevronRight, ExternalLink, Menu, Search, X} from "lucide-react";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";

// Define sidebar navigation structure
const sidebarItems = [
    {
        title: "Introduction",
        items: [
            { title: "Get Started", href: "/docs" },
            { title: "Installation", href: "/docs/installation" },
            { title: "Core Concepts", href: "/docs/core-concepts" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Basic Bot", href: "/docs/guides/basic-bot" },
            { title: "Command Handling", href: "/docs/guides/command-handling" },
            { title: "Event Handling", href: "/docs/guides/event-handling" },
            { title: "Error Handling", href: "/docs/guides/error-handling" },
        ],
    },
    {
        title: "API Reference",
        items: [
            { title: "Client", href: "/docs/api/client" },
            { title: "Commands", href: "/docs/api/commands" },
            { title: "Events", href: "/docs/api/events" },
            { title: "Utilities", href: "/docs/api/utilities" },
        ],
    },
    {
        title: "Examples",
        items: [
            { title: "Basic Examples", href: "/docs/examples/basic" },
            { title: "Advanced Use Cases", href: "/docs/examples/advanced" },
        ],
    },
    {
        title: "Resources",
        items: [
            { title: "Discord Server", href: "https://discord.gg/hfMzQMbaMg", isExternal: true },
            { title: "GitHub Repository", href: "https://github.com/AtsuLeVrai/nyxo.js", isExternal: true },
            { title: "Contributing", href: "/docs/contributing" },
        ],
    },
];

// Sidebar section component
function SidebarSection({
                            section,
                            isExpanded,
                            onToggle,
                            pathname
                        }: {
    section: typeof sidebarItems[0],
    isExpanded: boolean,
    onToggle: () => void,
    pathname: string
}) {
    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-2 font-medium text-slate-300 hover:text-primary-400"
            >
                <span>{section.title}</span>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            {isExpanded && (
                <ul className="mt-2 space-y-2 pl-2">
                    {section.items.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                {item.isExternal ? (
                                    <a
                                        href={item.href}
                                        className={`flex items-center py-1 text-sm ${
                                            isActive
                                                ? "text-primary-400"
                                                : "text-slate-400 hover:text-primary-400"
                                        }`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.title}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`block py-1 text-sm ${
                                            isActive
                                                ? "text-primary-400"
                                                : "text-slate-400 hover:text-primary-400"
                                        }`}
                                    >
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function DocsLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Track expanded sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        // Initialize with all sections expanded
        sidebarItems.reduce((acc, section) => {
            // Check if this section contains the active page
            // Expand sections containing active page by default
            // @ts-ignore
            acc[section.title] = section.items.some(
                item => item.href === pathname
            );
            return acc;
        }, {})
    );

    // Toggle section expansion
    const toggleSection = (title: string) => {
        setExpandedSections({
            ...expandedSections,
            [title]: !expandedSections[title],
        });
    };

    return (
        <div className="min-h-screen bg-dark-700 text-slate-50">
            <Header />

            <div className="pt-16">
                {/* Mobile sidebar toggle */}
                <div className="sticky top-16 z-20 flex items-center border-dark-500 border-b bg-dark-700/90 backdrop-blur-md lg:hidden">
                    <button
                        type="button"
                        className="px-4 py-3 text-slate-300 hover:text-white"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>

                    <div className="flex-1 px-4 py-3 font-medium text-slate-300">
                        Documentation
                    </div>

                    <div className="px-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-600 text-slate-300 hover:bg-dark-500 hover:text-primary-400">
                            <Search className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex">
                        {/* Sidebar - desktop */}
                        <div className="hidden w-64 shrink-0 border-r border-dark-500 pr-8 lg:block">
                            <div className="sticky top-32 h-screen overflow-y-auto pb-16">
                                <nav className="pt-6">
                                    {sidebarItems.map((section) => (
                                        <SidebarSection
                                            key={section.title}
                                            section={section}
                                            isExpanded={expandedSections[section.title] as boolean}
                                            onToggle={() => toggleSection(section.title)}
                                            pathname={pathname}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Mobile sidebar */}
                        {isSidebarOpen && (
                            <div className="fixed inset-0 z-40 lg:hidden">
                                <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                                <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-dark-700 p-6 shadow-xl">
                                    <div className="flex items-center justify-between pb-4">
                                        <h2 className="font-bold text-lg text-primary-400">Nyxo.js Docs</h2>
                                        <button
                                            type="button"
                                            className="rounded p-1 text-slate-400 hover:bg-dark-600 hover:text-white"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mt-6 overflow-y-auto">
                                        <nav>
                                            {sidebarItems.map((section) => (
                                                <SidebarSection
                                                    key={section.title}
                                                    section={section}
                                                    isExpanded={expandedSections[section.title] as boolean}
                                                    onToggle={() => toggleSection(section.title)}
                                                    pathname={pathname}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main content */}
                        <main className="w-full py-10 lg:py-16 lg:pl-8">
                            <div className="prose prose-invert max-w-3xl">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}