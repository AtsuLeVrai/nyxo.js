"use client";

import { SidebarContent } from "@/components/SidebarContent";
import { nyxIconTransparent } from "@/lib";
import { AnimatePresence, motion } from "framer-motion";
import { Book, Github, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type NavItem = {
    href: string;
    icon: typeof Home;
    label: string;
    external?: boolean;
};

const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/docs", icon: Book, label: "Documentation" },
    {
        href: "https://github.com/3tatsu/nyx.js",
        icon: Github,
        label: "GitHub",
        external: true,
    },
];

function NavLink({ href, icon: Icon, label, external }: NavItem) {
    const commonProps = {
        className: "hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2",
        ...(external && {
            target: "_blank",
            rel: "noopener noreferrer",
        }),
    };

    return external ? (
        <a
            href={href}
            {...commonProps}
        >
            <Icon size={20} />
            <span>{label}</span>
        </a>
    ) : (
        <Link
            href={href}
            {...commonProps}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
}

function Header() {
    return (
        <header className="bg-neutral-800 bg-opacity-90 p-4 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center space-x-4">
                <Image
                    src={nyxIconTransparent}
                    alt="Nyx.js Logo"
                    width={40}
                    height={40}
                />
                <h1 className="text-2xl font-bold">Nyx.js</h1>
            </div>
            <nav>
                <ul className="flex space-x-6">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <NavLink {...item} />
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

function Sidebar() {
    return (
        <motion.aside className="bg-neutral-800 p-4 flex flex-col overflow-hidden">
            <AnimatePresence>
                <SidebarContent />
            </AnimatePresence>
        </motion.aside>
    );
}

type LayoutProps = {
    header?: boolean;
    sidebar?: boolean;
    children: ReactNode;
};

export function Layout({ header = true, sidebar = true, children }: LayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {header && <Header />}
            <div className="flex flex-1">
                {sidebar && <Sidebar />}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
