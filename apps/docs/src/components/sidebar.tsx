import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Command,
    Database,
    ExternalLink,
    LayoutPanelLeft,
    Mic,
    Moon,
    Network,
    Package,
    Puzzle,
    Search,
    Server,
} from "lucide-react";
import Link from "next/link";

type SidebarProps = {
    readonly isSidebarOpen: boolean;
    setIsSidebarOpen(this: void, isOpen: boolean): void;
};

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
    return (
        <motion.aside
            initial={{ width: 256 }}
            animate={{ width: isSidebarOpen ? 256 : 64 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-neutral-800 p-4 flex flex-col overflow-hidden"
        >
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        {/* Search bar */}
                        <div className="mb-6 relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 bg-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        {/* Packages navigation */}
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">Packages</h2>
                        <ul className="space-y-2 mb-6">
                            <li>
                                <Link
                                    href="/packages/cli"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Command size={18} />
                                    <span>Cli</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/core"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Package size={18} />
                                    <span>Core</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/database"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Database size={18} />
                                    <span>Database</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/gateway"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Network size={18} />
                                    <span>Gateway</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/nyxjs"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Moon size={18} />
                                    <span>Nyx.js</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/panel"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <LayoutPanelLeft size={18} />
                                    <span>Panel</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/plugins"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Puzzle size={18} />
                                    <span>Plugins</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/rest"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Server size={18} />
                                    <span>Rest</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/packages/voice"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <Mic size={18} />
                                    <span>Voice</span>
                                </Link>
                            </li>
                        </ul>

                        {/* Quick Links */}
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">Quick Links</h2>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://discord.gg/your-discord"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <ExternalLink size={18} />
                                    <span>Join Discord</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/3tatsu/nyx.js/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-neutral-700 rounded-lg p-2 transition-all duration-200"
                                >
                                    <ExternalLink size={18} />
                                    <span>Report Issue</span>
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Toggle button */}
            <motion.button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mt-auto self-end bg-neutral-700 p-2 rounded-full hover:bg-neutral-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </motion.button>
        </motion.aside>
    );
}
