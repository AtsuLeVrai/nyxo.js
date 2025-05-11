"use client";

import { motion } from "framer-motion";
import { Code, FileJson, Terminal, Zap } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { CodeBlock, type ProgrammingLanguage } from "~/components/ui/CodeBlock";
import { Tabs } from "~/components/ui/Tabs";
import { useInView } from "~/hooks/useInView";

interface CodeExampleItem {
  id: string;
  label: string;
  icon: ReactElement;
  language: string;
  title: string;
  code: string;
  highlightedLines: number[];
}

export default function CodePreview() {
  const [activeTab, setActiveTab] = useState<string>("client");
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: "-100px" });

  // Code examples
  const codeExamples: CodeExampleItem[] = [
    {
      id: "client",
      label: "Client Setup",
      icon: <FileJson className="h-4 w-4" />,
      language: "typescript",
      title: "client.ts",
      code: "// Be patient !",
      highlightedLines: [8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 26],
    },
    {
      id: "command",
      label: "Slash Command",
      icon: <Terminal className="h-4 w-4" />,
      language: "typescript",
      title: "slash.command.ts",
      code: "// Be patient !",
      highlightedLines: [
        4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 19, 20, 21, 22, 31, 32, 33,
      ],
    },
    {
      id: "event",
      label: "Event Handler",
      icon: <Zap className="h-4 w-4" />,
      language: "typescript",
      title: "welcome.event.ts",
      code: "// Be patient !",
      highlightedLines: [
        4, 5, 6, 7, 10, 13, 14, 19, 20, 21, 22, 23, 24, 41, 42,
      ],
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
      transition={{ duration: 0.7 }}
      className="relative bg-dark-800 py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,75,255,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[center_top_-1px] bg-grid-pattern opacity-5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="primary" icon={<Code size={14} />} size="md" animated>
            Type-Safe Development
          </Badge>
          <h2 className="mt-4 font-extrabold text-3xl text-white sm:text-4xl">
            Build Discord bots{" "}
            <span className="text-primary-400">the right way</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-xl">
            Nyxo.js provides a structured, type-safe framework for building
            robust Discord bots with integrated TypeScript support.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-dark-500 bg-dark-700 shadow-xl">
          <Tabs
            items={codeExamples.map((example) => ({
              id: example.id,
              label: example.label,
              icon: example.icon,
              content: (
                <div className="p-4">
                  <CodeBlock
                    code={example.code}
                    language={example.language as ProgrammingLanguage}
                    title={example.title}
                    showLineNumbers={true}
                    highlightedLines={example.highlightedLines}
                  />
                </div>
              ),
            }))}
            defaultTab={activeTab}
            onChange={setActiveTab}
            variant="default"
          />
        </div>
      </div>
    </motion.section>
  );
}
