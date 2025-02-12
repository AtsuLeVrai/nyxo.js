"use client";

import { Layout } from "@/components/Layout";
import { nyxBanner } from "@/lib/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Coffee,
  Github,
  Puzzle,
  Shield,
  Terminal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <Layout sidebar={false}>
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Image
            src={nyxBanner}
            alt="Nyx.js Banner"
            width={500}
            height={500}
            className="mx-auto mb-8"
          />
          <h1 className="mb-6 inline-block py-2 font-bold text-5xl text-white">
            Welcome to Nyx.js
          </h1>
          <p className="mb-8 text-gray-300 text-xl">
            A powerful framework for creating Discord bots using TypeScript.
            Build feature-rich bots with ease and flexibility.
          </p>
          <div className="mb-8 flex justify-center space-x-4">
            <span className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-sm text-white">
              v1.0.0-alpha
            </span>
            <span className="rounded-full bg-red-600 px-3 py-1 font-semibold text-sm text-white">
              Alpha Release
            </span>
          </div>
          <div className="mx-auto grid max-w-md grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              href="/docs"
              className="group hover:-translate-y-1 relative flex transform items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-6 py-3 font-bold text-lg text-white transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight
                  size={20}
                  className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full scale-x-0 transform bg-blue-400 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
            </Link>
            <a
              href="https://github.com/3tatsu/nyx.js"
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:-translate-y-1 relative flex transform items-center justify-center overflow-hidden rounded-lg bg-gray-700 px-6 py-3 font-bold text-lg text-white transition-all duration-300 ease-in-out hover:bg-gray-800 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                View on GitHub
                <Github size={20} className="ml-2" />
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full scale-x-0 transform bg-gray-500 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
            </a>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10"
          >
            <section className="mb-16">
              <h2 className="mb-8 text-center font-semibold text-3xl">
                Key Features
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    className="rounded-lg bg-neutral-800 p-6 text-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="mb-4 text-blue-400">{feature.icon}</div>
                    <h3 className="mb-2 font-semibold text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
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
