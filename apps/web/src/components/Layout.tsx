"use client";

import { SidebarContent } from "@/components/SidebarContent";
import { nyxIconTransparent } from "@/lib/image";
import { AnimatePresence, motion } from "framer-motion";
import { Book, Github, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface LayoutProps {
  header?: boolean;
  sidebar?: boolean;
  children: ReactNode;
}

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  external?: boolean;
}

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
    className:
      "hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2",
    ...(external && {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  };

  return external ? (
    <a href={href} {...commonProps}>
      <Icon size={20} />
      <span>{label}</span>
    </a>
  ) : (
    <Link href={href} {...commonProps}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-800 bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <Image
          src={nyxIconTransparent}
          alt="Nyx.js Logo"
          width={40}
          height={40}
        />
        <h1 className="font-bold text-2xl">Nyx.js</h1>
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
    <motion.aside className="flex flex-col overflow-hidden bg-neutral-800 p-4">
      <AnimatePresence>
        <SidebarContent />
      </AnimatePresence>
    </motion.aside>
  );
}

export function Layout({
  header = true,
  sidebar = true,
  children,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <Header />}
      <div className="flex flex-1">
        {sidebar && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
